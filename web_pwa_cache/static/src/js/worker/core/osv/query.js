// Part of Odoo. See LICENSE file for full copyright and licensing details.
// Port to javascript by Tecnativa - Alexandre D. Díaz

odoo.define("web_pwa_cache.PWA.core.osv.Query", function (require) {
    "use strict";

    const expression = require('web_pwa_cache.PWA.core.osv.Expression');
    const OdooClass = require("web.Class");


    /**
     * Dumb implementation of a Query object, using 3 string lists so far
     * for backwards compatibility with the (table, where_clause, where_params) previously used.
     *
     * TODO: To be improved after v6.0 to rewrite part of the ORM and add support for:
     *   - auto-generated multiple table aliases
     *   - multiple joins to the same table with different conditions
     *   - dynamic right-hand-side values in domains  (e.g. a.name = a.description)
     *   - etc.
     */
    const Query = OdooClass.extend({

        init: function (tables, where_clause, where_clause_params, joins, extras) {
            // holds the list of tables joined using default JOIN.
            // the table names are stored double-quoted (backwards compatibility)
            this.tables = tables || [];

            // holds the list of WHERE clause elements, to be joined with
            // 'AND' when generating the final query
            this.where_clause = where_clause || [];

            // holds the parameters for the formatting of `where_clause`, to be
            // passed to psycopg's execute method.
            this.where_clause_params = where_clause_params || [];

            // holds table joins done explicitly, supporting outer joins. The JOIN
            // condition should not be in `where_clause`. The dict is used as follows:
            //   self.joins = {
            //                    'table_a': [
            //                                  ('table_b', 'table_a_col1', 'table_b_col', 'LEFT JOIN'),
            //                                  ('table_c', 'table_a_col2', 'table_c_col', 'LEFT JOIN'),
            //                                  ('table_d', 'table_a_col3', 'table_d_col', 'JOIN'),
            //                               ]
            //                 }
            //   which should lead to the following SQL:
            //       SELECT ... FROM "table_a" LEFT JOIN "table_b" ON ("table_a"."table_a_col1" = "table_b"."table_b_col")
            //                                 LEFT JOIN "table_c" ON ("table_a"."table_a_col2" = "table_c"."table_c_col")
            this.joins = joins || {};

            // holds extra conditions for table joins that should not be in the where
            // clause but in the join condition itself. The dict is used as follows:
            //
            //   self.extras = {
            //       ('table_a', ('table_b', 'table_a_col1', 'table_b_col', 'LEFT JOIN')):
            //           ('"table_b"."table_b_col3" = %s', [42])
            //   }
            //
            // which should lead to the following SQL:
            //
            //   SELECT ... FROM "table_a"
            //   LEFT JOIN "table_b" ON ("table_a"."table_a_col1" = "table_b"."table_b_col" AND "table_b"."table_b_col3" = 42)
            //   ...
            this.extras = extras || {};
        },

        _get_table_aliases: function () {
            const result = [];
            for (let from_statement of this.tables) {
                result.push(expression.get_alias_from_query(from_statement)[1]);
            }
            return result;
        },

        _get_alias_mapping: function () {
            const mapping = {};
            for (let table of this.tables) {
                const [alias, statement] = expression.get_alias_from_query(table);
                mapping[statement] = table;
            }
            return mapping;
        },

        /**
         * Join a destination table to the current table.
         *
         *       :param implicit: False if the join is an explicit join. This allows
         *           to fall back on the previous implementation of ``join`` before
         *           OpenERP 7.0. It therefore adds the JOIN specified in ``connection``
         *           If True, the join is done implicitely, by adding the table alias
         *           in the from clause and the join condition in the where clause
         *           of the query. Implicit joins do not handle outer, extra, extra_params parameters.
         *       :param connection: a tuple ``(lhs, table, lhs_col, col, link)``.
         *           The join corresponds to the SQL equivalent of::
         *
         *           (lhs.lhs_col = table.col)
         *
         *           Note that all connection elements are strings. Please refer to expression.py for more details about joins.
         *
         *       :param outer: True if a LEFT OUTER JOIN should be used, if possible
         *               (no promotion to OUTER JOIN is supported in case the JOIN
         *               was already present in the query, as for the moment
         *               implicit INNER JOINs are only connected from NON-NULL
         *               columns so it would not be correct (e.g. for
         *               ``_inherits`` or when a domain criterion explicitly
         *               adds filtering)
         *
         *       :param extra: A string with the extra join condition (SQL), or None.
         *           This is used to provide an additional condition to the join
         *           clause that cannot be added in the where clause (e.g., for LEFT
         *           JOIN concerns). The condition string should refer to the table
         *           aliases as "{lhs}" and "{rhs}".
         *
         *       :param extra_params: a list of parameters for the `extra` condition.
         */
        add_join: function (connection, implicit=true, outer=false, extra=undefined, extra_params=[]) {
            [lhs, table, lhs_col, col, link] = connection;
            alias, alias_statement = expression.generate_table_alias(lhs, [[table, link]])

            if (implicit) {
                if (this.tables.indexOf(alias_statement) === -1) {
                    this.tables.push(alias_statement);
                    const condition = `("${lhs}"."${lhs_col}" = "${alias}"."${col}")`;
                    this.where_clause.push(condition);
                }
                else {
                    // already joined
                    return;
                }
                return [alias, alias_statement];
            }
            else {
                if (this.tables.indexOf(alias_statement) !== -1) {
                    // already joined, must ignore (promotion to outer and multiple joins not supported yet)
                    return;
                }
                else {
                    // add JOIN
                    this.tables.push(alias_statement);
                    const join_tuple = [alias, lhs_col, col, outer && 'LEFT JOIN' || 'JOIN'];
                    this.joins = (lhs in d && d[lhs] !== null) || (d[lhs] = []);
                    this.joins.push(join_tuple);
                    if (extra || extra_params) {
                        extra = (extra || '').format(lhs=lhs, rhs=alias)
                        this.extras[[lhs, join_tuple]] = [extra, extra_params];
                    }
                }
                return [alias, alias_statement];
            }
        },

        /**
         * Returns (query_from, query_where, query_params).
         */
        get_sql: function () {
            let tables_to_process = _.clone(this.tables);
            const alias_mapping = this._get_alias_mapping();
            const from_clause = [];
            const from_params = [];

            const add_joins_for_table = (lhs) => {
                const joins = lhs in this.joins && this.joins[lhs] || [];
                for (let [rhs, lhs_col, rhs_col, join] of joins) {
                    tables_to_process = _.without(tables_to_process, alias_mapping[rhs]);
                    from_clause.push(` ${join} ${alias_mapping[rhs]} ON ("${lhs}"."${lhs_col}" = "${rhs}"."${rhs_col}"`);
                    const key = [lhs, [rhs, lhs_col, rhs_col, join]];
                    const extra = key in this.extras && this.extras[key];
                    if (extra) {
                        if (extra[0]) {
                            from_clause.push(' AND ');
                            from_clause.push(extra[0]);
                        }
                        if (extra[1]) {
                            from_params.push(extra[1]);
                        }
                    }
                    from_clause.push(')');
                    add_joins_for_table(rhs);
                }
            }

            for (let pos in tables_to_process) {
                const table = tables_to_process[pos];
                if (pos > 0) {
                    from_clause.push(',');
                }
                from_clause.push(table);
                const table_alias = expression.get_alias_from_query(table)[1];
                if (table_alias in this.joins) {
                    add_joins_for_table(table_alias);
                }
            }

            return [from_clause.join(""), this.where_clause.join(" AND "), from_params.concat(this.where_clause_params)];
        },

        toString: function () {
            const [from_clause, where_clause, where_clause_params] = this.get_sql();
            return `<osv.Query: "SELECT ... FROM ${from_clause} WHERE ${where_clause}" with params: ${where_clause_params}>`;
        },
    });

    return Query;

});
