"use strict";
/* eslint strict: ["error", "global"] */
/* eslint-disable no-undef, no-implicit-globals, no-unused-vars */
/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

const OdooQuery = OdooClass.extend({
    _logic_operators: {
        "&": {
            arity: 2,
            frmt: "($l0 && $l1)",
        },
        "|": {
            arity: 2,
            frmt: "($l0 || $l1)",
        },
        "!": {
            arity: 1,
            frmt: "!($l0)",
        },
    },

    _odoo_operators: {
        // 'child_of' is not implemented.
        // Fallback to 'false' seems to be the best strategy
        "child_of": function () {
            return false;
        },

        "=": function (leafL, leafR) {
            return leafL === leafR;
        },
        "=?": function (leafL, leafR) {
            if (leafR === null || leafR === false || typeof leafR === 'undefined') {
                return true;
            }
            return this["="](leafL, leafR);
        },
        "!=": function (leafL, leafR) {
            return leafL !== leafR;
        },
        ">": function (leafL, leafR) {
            return leafL > leafR;
        },
        ">=": function (leafL, leafR) {
            return leafL >= leafR;
        },
        "<": function (leafL, leafR) {
            return leafL < leafR;
        },
        "<=": function (leafL, leafR) {
            return leafL <= leafR;
        },
        "=like": function (leafL, leafR) {
            const r = new RegExp(leafR.replace(/%/g, ".*").replace(/_/g, ".+"));
            return (leafL && r.test(leafL)) || false;
        },
        like: function (leafL, leafR) {
            const r = new RegExp(
                `.*${leafR.replace(/%/g, ".*").replace(/_/g, ".+")}.*`
            );
            return (leafL && r.test(leafL)) || false;
        },
        "not like": function (leafL, leafR) {
            return !this["like"](leafL, leafR);
        },
        "=ilike": function (leafL, leafR) {
            const r = new RegExp(
                leafR.replace(/%/g, ".*").replace(/_/g, ".+"),
                "i"
            );
            return (leafL && r.test(leafL)) || false;
        },
        ilike: function (leafL, leafR) {
            const r = new RegExp(
                `.*${leafR.replace(/%/g, ".*").replace(/_/g, ".+")}.*`,
                "i"
            );
            return (leafL && r.test(leafL)) || false;
        },
        "not ilike": function (leafL, leafR) {
            return !this["ilike"](leafL, leafR);
        },
        in: function (leafL, leafR) {
            return (leafL && leafR.indexOf(leafL) !== -1) || false;
        },
        "not in": function (leafL, leafR) {
            return !this["in"](leafL, leafR);
        },
    },

    /**
     * Basic implementation to query a collection using Odoo domain syntax
     * The domain needs be a "resolved domain".
     * Doesn't support 'child_of'
     *
     * @param {Array[Object]} records
     * @param {String|Array} domain
     * @returns {Array[Object]}
     */
    run: function (records, domain) {
        if (!records || !records.length) {
            return [];
        }
        let sdomain = domain || [];
        if (typeof sdomain === "string") {
            sdomain = JSON.parse(domain);
        }

        if (!sdomain.length) {
            return records;
        }

        const results = [];
        const records_len = records.length;
        let index = 0;
        while (index < records_len) {
            const record = records[index];
            const to_eval = this._doOper(record, sdomain);
            if (eval(to_eval)) {
                results.push(record);
            }
            ++index;
        }
        return results;
    },

    /**
     * @param {String} frmtStr
     * @param {Array} params
     */
    _formatLogicOperator: function (frmtStr, params) {
        return frmtStr.replace("$l0", params[0]).replace("$l1", params[1]);
    },

    /**
     * Gets the record id or value
     * Example:
     *   - in: [1, "Test"]
     *   - out: 1
     *
     * @param {Array} value
     */
    _getValueOrID: function (value) {
        if (_.isArray(value)) {
            return value[0];
        }
        return value;
    },

    /**
     * @param {Object} record
     * @param {Number} index_criteria
     */
    _doOper: function (record, domain, index_criteria = 0) {
        const criteria = domain[index_criteria];
        let oper_def = this._logic_operators["&"];
        let offset = 0;
        if (typeof criteria === "string") {
            oper_def = this._logic_operators[criteria];
            ++offset;
        }
        const tparams = new Array(2); // 2 is the max. arity
        for (let e = 0; e < oper_def.arity; ++e) {
            const ncriteria = domain[index_criteria + e + offset];
            if (typeof ncriteria === "string") {
                tparams[e] = this._doOper(record, index_criteria + e + offset);
            } else if (ncriteria) {
                tparams[e] = this._odoo_operators[ncriteria[1]](
                    this._getValueOrID(record[ncriteria[0]]),
                    ncriteria[2]
                );
            } else {
                tparams[e] = true;
            }
        }

        if (index_criteria + oper_def.arity < domain.length) {
            tparams[0] = this._formatLogicOperator(oper_def.frmt, tparams);
            tparams[1] = this._doOper(record, index_criteria + oper_def.arity + 1);
        }
        return this._formatLogicOperator(oper_def.frmt, tparams);
    },
});

const OdooDatabase = OdooClass.extend(ParentedMixin, {
    /**
     * @override
     * @param {DatabaseManagerClass} db
     */
    init: function (parent, db) {
        ParentedMixin.init.call(this);
        this.setParent(parent);
        this._db = db;
        this._odooQuery = new OdooQuery();
    },

    //-------------------
    // RECORDS
    //-------------------

    /**
     * @param {Strins} model
     * @param {Object} data
     * @returns {Promise}
     */
    create: function (model, datas) {
        let sdatas = datas;
        if (typeof datas !== 'array') {
            sdatas = [datas];
        }
        const records_data = _.map(sdatas, item => _.defaults(item, {__model: model}));
        return this._db.createRecords("webclient", "records", records_data);
    },

    /**
     * @param {String} model
     * @param {Array[Object]} data
     * @param {Number} force_id
     * @returns {Promise}
     */
    write: function (model, rc_ids, data) {
        const sdata = _.omit(_.defaults(data, {__model: model}), 'id');
        const tasks = [];
        for (const id of rc_ids) {
            tasks.push(this._db.updateRecords("webclient", "records", false, [model, id], sdata));
        }
        return Promise.all(tasks);
    },

    /**
     * @private
     * @param {String} model
     * @param {Object} data
     * @param {Boolean} allow_create
     * @returns {Promise}
     */
    writeOrCreate: function (model, datas, allow_create) {
        return new Promise(async (resolve) => {
            for (const data of datas) {
                try {
                    await this.write(model, [data.id], data);
                } catch (err) {
                    if (allow_create) {
                        try {
                            await this.create(model, data);
                        } catch (err) {
                            // do nothing
                        }
                    }
                    // do nothing
                }
            }

            return resolve();
        });
    },

    /**
     * @param {String} model
     * @param {Array[Number]} rc_ids
     * @returns {Promise}
     */
    unlink: function (model, rc_ids) {
        const tasks = [];
        for (const id of rc_ids) {
            tasks.push(this._db.deleteRecords("webclient", "records", false, [model, id]));
        }
        return Promise.all(tasks);
    },

    /**
     * @param {String} model
     * @param {String} domain
     * @param {Number} limit
     * @param {Number} offset
     * @param {String} orderby (Example: "name DESC, city, sequence ASC")
     * @return {Promise[Array[Object]]}
     */
    search: function (
        model,
        domain,
        limit = -1,
        offset = 0,
        orderby = undefined
    ) {
        return new Promise(async (resolve, reject) => {
            try {
                const model_info = this.getModelInfo(model);
                let records = await this._db.getRecords("webclient", "records", "model", model);
                if (_.isEmpty(records)) {
                    return reject();
                }
                records = this.query(records, domain);
                const records_count = records.length;
                let orders = (orderby || model_info.orderby || "id").split(",");
                orders.reverse();
                for (const order of orders) {
                    const order_parts = order.trim().split(" ");
                    if (order_parts.length === 1) {
                        order_parts.push("desc");
                    }
                    records = _.sortBy(records, order_parts[0].trim());
                    if (order_parts[1].trim().toLowerCase() === "desc") {
                        records.reverse();
                    }
                }
                if (limit !== -1) {
                    records = records.slice(
                        offset,
                        offset + limit
                    );
                }
                return resolve([records, records_count]);
            } catch (err) {
                return reject(err);
            }
        });
    },

    /**
     * @param {String} model
     * @param {Number} rec_id
     * @param {String} domain
     * @returns {Promise[Object]}
     */
    browse: function (model, rc_ids) {
        return new Promise(async (resolve, reject) => {
            try {
                const tasks = [];
                const s_rc_ids = (rc_ids instanceof Array)?rc_ids:[rc_ids];
                for (const id of s_rc_ids) {
                    tasks.push(this._db.getRecords("webclient", "records", false, [model, id]));
                }
                let records = await Promise.all(tasks);
                records = _.flatten(records);
                if (_.isEmpty(records)) {
                    return reject();
                }
                return resolve(records);
            } catch (err) {
                return reject(err);
            }
        });
    },

    /**
     * @param {String} xmlid
     * @returns {Promise}
     */
    ref: function (xmlid) {
        return new Promise(async (resolve, reject) => {
            try {
                const model_data = await this.getModelData(xmlid);
                let record = {};
                if (model_data.model.startsWith('ir.actions.')) {
                    record = await this._db.getRecord("webclient", "actions", false, model_data.res_id);
                } else {
                    const records = await this.browse(model_data.model, model_data.res_id);
                    if (records.length) {
                        record = records[0];
                    }
                }

                if (_.isEmpty(record)) {
                    return reject();
                }

                return resolve(record);
            } catch (err) {
                return reject(err);
            }
        });
    },

    /**
     * @param {String} model
     * @param {Array[String]} fields
     * @returns {Promise}
     */
    getModelFieldsInfo: function (model, fields) {
        return new Promise(async (resolve, reject) => {
            try {
                const model_info = await this.getModelInfo(model);
                const field_infos = {};
                for (const field of fields) {
                    field_infos[field] = model_info.fields[field];
                }
                return resolve(field_infos);
            } catch (err) {
                return reject();
            }
        });
    },

    /**
     *
     * @param {String} model
     * @param {Number} rec_id
     * @returns {Promise}
     */
    isOfflineRecord: function(model, rec_id) {
        return new Promise(async resolve => {
            try {
                const records = await this._db.getModelRecords("webclient", "sync", false);
                const record = _.findWhere(
                    records, record => record.model === model &&
                    record.method === "create" && record.args[0].id === rec_id
                );
                if (record) {
                    return resolve(true);
                }
                return resolve(false);
            } catch (err) {
                return resolve(false);
            }
        });
    },

    /**
     * Basic implementation to query a collection using Odoo domain syntax
     * The domain needs be a "resolved domain".
     * Doesn't support 'child_of'
     *
     * @param {Array[Object]} records
     * @param {String|Array} domain
     * @returns {Array[Object]}
     */
    query: function (records, domain) {
        return this._odooQuery.run(records, domain);
    },

    /**
     * Generates a temporal id for offline records.
     * Odoo only works with numbers.
     *
     * @returns {Number}
     */
    genRecordID: function () {
        return 90000000 + new Date().getTime();
    },

    //-------------------
    // HELPERS
    //-------------------

    getModelInfo: function (model) {
        return new Promise(async (resolve) => {
            if (model) {
                try {
                    const record = await this._db.getRecord("webclient", "model", false, model);
                    return resolve(record);
                } catch (err) {
                    // do nothing
                }
                return resolve({});
            }

            try {
                const records = await this._db.getRecords("webclient", "model");
                return resolve(records);
            } catch (err) {
                // do nothing
            }
            return resolve([])
        });
    },

    /**
     * @param {String} xmlid
     * @returns {Promise}
     */
    getModelData: function (xmlid) {
        return new Promise(async (resolve, reject) => {
            const module_name = xmlid.split(".", 1)[0];
            const name = xmlid.substr(module_name.length + 1);
            try {
                const record = await this._db.getRecord("webclient", "model_data", "module_name", [module_name, name]);
                return resolve(record);
            } catch (err) {
                return reject(err);
            }
        });
    },

    /**
     * @params {String} model
     * @returns {Promise}
     */
    getModelDefaults: function (model) {
        return new Promise(async (resolve, reject) => {
            try {
                const records = await this._db.getRecords("webclient", "defaults", "model", model);
                let values = {};
                const sandbox = new JSSandbox();
                for (const record of records) {
                    if (typeof record.formula !== 'undefined') {
                        sandbox.compile(record.formula);
                        values = sandbox.run();
                    }
                }
                return resolve(values);
            } catch (err) {
                return reject(err);
            }
        });
    },


    updateModelInfo: function (model, data) {
        const record_data = _.extend({}, data, {model: model});
        return this._db.updateRecords("webclient", "model", false, model, record_data);
    },

    /**
     * Helper function to obtain the associated onchange by the request parameters
     *
     * @param {Array[Object]} records
     * @param {String} onchange_field
     * @param {Object} record_data
     * @returns {Array[Object]}
     */
    filterOnchangeRecordsByParams: function (records, onchange_field, record_data) {
        const res = [];
        for (const record of records) {
            var params = _.pick(record_data, onchange_field);

            // Construct params using "trigger" fields
            if (record.triggers) {
                const trigger_fields = record.triggers.split(",");
                for (const field of trigger_fields) {
                    const sfield = field.trim();
                    if (!sfield.includes(".")) {
                        params[sfield] = record_data[sfield];
                        continue;
                    }
                    const levels = sfield.split(".");
                    var value = record_data;
                    var temp_arr_value = params;
                    var last_level = levels[0];
                    for (var index=0; index<levels.length; ++index) {
                        const level = levels[index];
                        if (!temp_arr_value[level]) {
                            temp_arr_value[level] = {};
                        }
                        if (index < levels.length-1) {
                            temp_arr_value = temp_arr_value[level];
                        }
                        value = value[level];
                        last_level = level;
                    }
                    temp_arr_value[last_level] = value;
                }
            }

            if (_.isEqual(record.params, params)) {
                res.push(record);
                continue;
            }
            let is_full_match = true;
            for (const field_name in params) {
                const record_param_value = record.params[field_name];
                if (!record_param_value) {
                    is_full_match = false;
                    break;
                }
                if (record_param_value instanceof Array &&
                    record_param_value.length === 3
                ) {
                    // Check 'params commands'
                    if (record_param_value[0] === 'r' &&
                        (
                            params[field_name] < record_param_value[1] ||
                            params[field_name] > record_param_value[2]
                        )
                    ) {
                        is_full_match = false;
                        break;
                    }
                } else if (!_.isEqual(record_param_value, params[field_name])) {
                    is_full_match = false;
                    break;
                }
            }
            if (is_full_match) {
                res.push(record);
            }
        }
        return res;
    },

    /**
     * Remove old records
     *
     * @param {String} model
     * @param {Array[int]} oids
     * @returns {Promise[Array[Number]]}
     */
    vacuumRecords: function (model, oids) {
        return new Promise(async (resolve, reject) => {
            try {
                const records = await this.search(model, []);
                const cur_ids = _.map(records, "id");
                const ids_to_remove = _.difference(oids, cur_ids);
                this.unlink(model, ids_to_remove);
                return resolve(ids_to_remove);
            } catch (err) {
                return reject(err);
            }
        });
    },

    /**
     * @param {String} field
     * @returns {Boolean}
     */
    isInternalField: function (field) {
        return (field === "__model");
    },
});
