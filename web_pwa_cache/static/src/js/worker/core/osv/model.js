// Part of Odoo. See LICENSE file for full copyright and licensing details.
// Port to javascript by Tecnativa - Alexandre D. Díaz

odoo.define("web_pwa_cache.PWA.core.osv.Model", function (require) {
    "use strict";

    const expression = require('web_pwa_cache.PWA.core.osv.Expression');
    const Query = require('web_pwa_cache.PWA.core.osv.Query');
    const OdooClass = require("web.Class");
    const ParentedMixin = require('web.mixins').ParentedMixin;

    const Model = OdooClass.extend(ParentedMixin, {
        regex_order: new RegExp(/^(\s*([a-z0-9:_]+|"[a-z0-9:_]+")(\s+(desc|asc))?\s*(,|$))+(?<!,)$/, 'i'),

        init: function (parent, dbmanager) {
            ParentedMixin.init.call(this);
            this.setParent(parent);
            // This is necessary due to a cross dependency because 'expression' can run 'high-level' subqueries.
            this._dbmanager = dbmanager;
        },

        _where_calc: function(model_info, domain) {
            return new Promise(async (resolve, reject) => {
                try {
                    let tables, where_clause, where_params;
                    if (domain) {
                        const e = new expression.Expression(domain, model_info, this._dbmanager);
                        await e.parse();
                        tables = e.get_tables();
                        [where_clause, where_params] = e.to_sql();
                        where_clause = where_clause ? [where_clause] : [];
                    }
                    else {
                        [where_clause, where_params, tables] = [[], [], [`"${model_info.table}"`]];
                    }

                    return resolve(new Query(tables, where_clause, where_params));
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * Attempt to construct an appropriate ORDER BY clause based on order_spec, which must be
         * a comma-separated list of valid field names, optionally followed by an ASC or DESC direction.
         *
         *  :raise ValueError in case order_spec is malformed
         */
        _generate_order_by: function (model_info, order_spec, query) {
            return new Promise(async (resolve, reject) => {
                try {
                    let order_by_clause = '';
                    const n_order_spec = order_spec || model_info.orderby;
                    if (n_order_spec) {
                        const order_by_elements = await this._generate_order_by_inner(model_info, model_info.table, n_order_spec, query);
                        if (order_by_elements) {
                            order_by_clause = order_by_elements.join(",");
                        }
                    }

                    return resolve(order_by_clause && ` ORDER BY ${order_by_clause} ` || '');
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * Add possibly missing JOIN to ``query`` and generate the ORDER BY clause for m2o fields,
         * either native m2o fields or function/related fields that are stored, including
         * intermediate JOINs for inheritance if required.
         *
         * :return: the qualified field name to use in an ORDER BY clause to sort by ``order_field``
         */
        _generate_m2o_order_by: function (model_info, alias, order_field, query, reverse_direction, seen) {
            return new Promise(async (resolve, reject) => {
                try {
                    let field = model_info.fields[order_field];
                    let n_alias = alias;
                    let n_order_field = order_field;
                    if (field.inherited) {
                        // also add missing joins for reaching the table containing the m2o field
                        const qualified_field = await this._inherits_join_calc(n_alias, n_order_field, query);
                        [n_alias, n_order_field] = qualified_field.replaceAll('"', '').split('.', 1);
                        field = field.base_field;
                    }

                    if (!field.store) {
                        console.log(
                            `Many2one function/related fields must be stored to be used as ordering fields! Ignoring sorting for ${model_info.model}.${order_field}`
                        );
                        return [];
                    }

                    // figure out the applicable order_by for the m2o
                    const dest_model = await this._dbmanager.sqlitedb.getModelInfo(field.comodel_name);
                    let m2o_order = dest_model.orderby;
                    if (!m2o_order.match(this.regex_order)) {
                        // _order is complex, can't use it here, so we default to _rec_name
                        m2o_order = dest_model.rec_name;
                    }

                    // Join the dest m2o table if it's not joined yet. We use [LEFT] OUTER join here
                    // as we don't want to exclude results that have NULL values for the m2o
                    const join = [n_alias, dest_model.table, n_order_field, 'id', n_order_field];
                    const [dest_alias] = query.add_join(join, false, true);
                    const orders = await this._generate_order_by_inner(dest_model, dest_alias, m2o_order, query, reverse_direction, seen);
                    return resolve(orders);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * Adds missing table select and join clause(s) to ``query`` for reaching
         * the field coming from an '_inherits' parent table (no duplicates).
         *
         * :param alias: name of the initial SQL alias
         * :param fname: name of inherited field to reach
         * :param query: query object on which the JOIN should be added
         * :return: qualified name of field, to be used in SELECT clause
         */
        _inherits_join_calc: function (model_info, alias, fname, query, implicit=true, outer=false) {
            return new Promise(async (resolve, reject) => {
                try {
                    // INVARIANT: alias is the SQL alias of model._table in query
                    let [model, field] = [model_info, model_info.fields[fname]];
                    while (field.inherited) {
                        // retrieve the parent model where field is inherited from
                        const parent_model = await this._dbmanager.sqlitedb.getModelInfo(field.related_field.model_name);
                        const parent_fname = field.related[0];
                        // JOIN parent_model._table AS parent_alias ON alias.parent_fname = parent_alias.id
                        const [parent_alias] = query.add_join(
                            [alias, parent_model._table, parent_fname, 'id', parent_fname],
                            implicit=implicit, outer=outer,
                        )
                        [model, alias, field] = [parent_model, parent_alias, field.related_field];
                    }
                    // handle the case where the field is translated
                    if (field.translate) {
                        return resolve(this._generate_translated_field(model, alias, fname, query));
                    }
                } catch (err) {
                    return reject(err);
                }

                return resolve(`"${alias}"."${fname}"`);
            });
        },

        /**
         * Add possibly missing JOIN with translations table to ``query`` and
         * generate the expression for the translated field.
         *
         * :return: the qualified field name (or expression) to use for ``field``
         */
        _generate_translated_field: function (model_info, table_alias, field, query) {
            // if self.env.lang:
            //     # Sub-select to return at most one translation per record.
            //     # Even if it shoud probably not be the case,
            //     # this is possible to have multiple translations for a same record in the same language.
            //     # The parenthesis surrounding the select are important, as this is a sub-select.
            //     # The quotes surrounding `ir_translation` are important as well.
            //     unique_translation_subselect = """
            //         (SELECT res_id, value FROM "ir_translation"
            //          WHERE type='model' AND name=%s AND lang=%s AND value!='')
            //     """
            //     alias, alias_statement = query.add_join(
            //         (table_alias, unique_translation_subselect, 'id', 'res_id', field),
            //         implicit=False,
            //         outer=True,
            //         extra_params=["%s,%s" % (self._name, field), self.env.lang],
            //     )
            //     return 'COALESCE("%s"."%s", "%s"."%s")' % (alias, 'value', table_alias, field)
            // else:
            //     return '"%s"."%s"' % (table_alias, field)
            return `"${table_alias}"."${field}"`;
        },

        _generate_order_by_inner: function (model_info, alias, order_spec, query, reverse_direction=false, seen=[]) {
            return new Promise(async (resolve, reject) => {
                try {
                    this._check_qorder(order_spec)

                    const order_by_elements = [];
                    const order_spec_splitted = order_spec.split(',');
                    for (let order_part of order_spec_splitted) {
                        const order_split = order_part.trim().split(' ');
                        const order_field = order_split[0].trim();
                        let order_direction = order_split.length === 2 ? order_split[1].trim().toUpperCase() : '';
                        if (reverse_direction) {
                            order_direction = order_direction === 'DESC' ? 'ASC' : 'DESC';
                        }
                        const do_reverse = order_direction === 'DESC';

                        let field = model_info.fields[order_field];
                        if (!field) {
                            throw Error(`Sorting field ${order_field} not found on model ${model_info.model}`);
                        }

                        if (order_field === 'id') {
                            order_by_elements.push(`"${alias}"."${order_field}" ${order_direction}`);
                        }
                        else {
                            if (field.inherited) {
                                field = field.base_field;
                            }
                            if (field.store && field.type === 'many2one') {
                                key = [field.model_name, field.comodel_name, order_field];
                                if (_.findIndex(seen, key) === -1) {
                                    seen.push(key);
                                    order_by_elements = order_by_elements.concat(
                                        await this._generate_m2o_order_by(model_info, alias, order_field, query, do_reverse, seen)
                                    );
                                }
                            }
                            else if (field.store && field.column_type) {
                                let qualifield_name = await this._inherits_join_calc(alias, order_field, query, implicit=false, outer=true)
                                if (field.type === 'boolean') {
                                    qualifield_name = `COALESCE(${qualifield_name}, false)`;
                                }
                                order_by_elements.push(`${qualifield_name} ${order_direction}`);
                            }
                            else {
                                continue;  // ignore non-readable or "non-joinable" fields
                            }
                        }
                    }

                    return resolve(order_by_elements);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        _check_qorder: function (word) {
            if (!word.match(this.regex_order)) {
                throw Error('Invalid "order" specified. A valid "order" specification is a comma-separated list of valid field names (optionally followed by asc/desc for the direction)');
            }
            return true;
        },

        /**
         * Private implementation of search() method, allowing specifying the uid to use for the access right check.
         * This is useful for example when filling in the selection list for a drop-down and avoiding access rights errors,
         * by specifying ``access_rights_uid=1`` to bypass access rights check, but not ir.rules!
         * This is ok at the security level because this method is private and not callable through XML-RPC.
         *
         * :param access_rights_uid: optional user ID to use when checking access rights
         *    (not for ir.rules, this is only for ir.model.access)
         * :return: a list of record ids or an integer (if count is True)
         */
        query: function (model_info, args, offset=0, limit=undefined, order=undefined, field_names=undefined, count=false) {
            return new Promise(async (resolve, reject) => {
                try {
                    const db = this.getParent().getDB();

                    //self.sudo(access_rights_uid or self._uid).check_access_rights('read')
                    if (expression.is_false(model_info, args)) {
                        // optimization: no need to query, as no record satisfies the domain
                        return resolve(count ? 0 : []);
                    }

                    const query = await this._where_calc(model_info, args);
                    //self._apply_ir_rules(query, 'read')
                    const order_by = await this._generate_order_by(model_info, order, query);
                    const [from_clause, where_clause, where_clause_params] = query.get_sql();

                    const where_str = where_clause && ` WHERE ${where_clause}` || '';

                    if (count) {
                        // Ignore order, limit and offset when just counting, they don't make sense and could
                        // hurt performance
                        const query_str = `SELECT count(1) as rec_count FROM ${from_clause} ${where_str}`;
                        const sql = _.str.sprintf(query_str, where_clause_params);
                        const res = await db.get([sql]);
                        return resolve(res.rec_count || 0);
                    }

                    const limit_str = limit && ` limit ${limit}` || '';
                    const offset_str = offset && ` offset ${offset}` || '';
                    let select_clause = `"${model_info.table}".id`;
                    if (field_names instanceof Array) {
                        if (_.isEmpty(field_names)) {
                            select_clause = "*";
                        } else {
                            select_clause = field_names.map(field_name => `"${model_info.table}".${field_name}`).join(",");
                        }
                    }
                    const query_str = `SELECT ${select_clause} FROM ` + from_clause + where_str + order_by + limit_str + offset_str
                    // console.log("--------------------------- THE SQL");
                    // console.log(query_str);
                    const sql = _.str.sprintf.apply(this, [query_str].concat(where_clause_params));
                    // console.log(sql);
                    const res = await db.all([sql]);
                    if (!field_names) {
                        return resolve(_.chain(res).map("id").unique().value());
                    }
                    return resolve(res);
                } catch (err) {
                    return reject(err);
                }
            });
        },
    });

    return Model;
});
