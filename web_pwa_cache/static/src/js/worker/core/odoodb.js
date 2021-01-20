/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_cache.PWA.core.OdooDatabase", function (require) {
    "use strict";

    const ParentedMixin = require('web.mixins').ParentedMixin;
    const OdooClass = require("web.Class");
    const Model = require("web_pwa_cache.PWA.core.osv.Model");


    const OdooDatabase = OdooClass.extend(ParentedMixin, {

        /**
         * @override
         * @param {DatabaseManagerClass} db
         */
        init: function (parent) {
            ParentedMixin.init.call(this);
            this.setParent(parent);
            this._dbmanager = this.getParent()._dbmanager;
            this._osv = new Model(this);
        },

        //-------------------
        // RECORDS
        //-------------------

        /**
         * @param {Object/String} model
         * @param {Object} data
         * @returns {Promise}
         */
        create: function (model_info, datas) {
            return new Promise(async (resolve, reject) => {
                try {
                    const tasks = [];
                    if (typeof model_info === "string") {
                        model_info = await this._dbmanager.getModelInfo(model_info);
                    }
                    if (!(datas instanceof Array)) {
                        datas = [datas];
                    }
                    for (let values of datas) {
                        tasks.push(this._dbmanager.createRecord(model_info, _.omit(values, this._getFieldNamesByType(model_info, "binary"))));
                        // if (pick_keys.binary.length) {
                        //     tasks.push(this._db.updateRecords("webclient", "binary", false, [model, id], _.chain(sdata).pick(pick_keys.binary_pathkey).extend({model: model}).value()));
                        // }
                    }
                    await Promise.all(tasks);
                    return resolve();
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * @param {Object/String} model_info
         * @param {Array} rc_ids
         * @param {Object} data
         * @returns {Promise}
         */
        write: function (model_info, rc_ids, data) {
            return new Promise(async (resolve, reject) => {
                try {
                    if (typeof model_info === "string") {
                        model_info = await this._dbmanager.getModelInfo(model_info);
                    }

                    const sdata = _.omit(data, 'id');
                    const tasks = [];
                    for (let id of rc_ids) {
                        tasks.push(this._dbmanager.updateRecord(model_info, [id], _.chain(sdata).omit(this._getFieldNamesByType(model_info, "binary")).value()));
                        // if (pick_keys.binary.length) {
                        //     tasks.push(this._db.updateRecords("webclient", "binary", false, [model, id], _.chain(sdata).pick(pick_keys.binary_pathkey).extend({model: model}).value()));
                        // }
                    }
                    const res = await Promise.all(tasks);
                    return resolve(res);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * @private
         * @param {Object/String} model_info
         * @param {Array} datas
         * @param {Boolean} allow_create
         * @returns {Promise}
         */
        writeOrCreate: function (model_info, datas, allow_create) {
            return new Promise(async (resolve) => {
                try {
                    if (typeof model_info === "string") {
                        model_info = await this._dbmanager.getModelInfo(model_info);
                    }

                    const tasks = [];
                    for (const values of datas) {
                        tasks.push(this._dbmanager.createOrUpdateRecord(model_info, _.chain(values).omit(this._getFieldNamesByType(model_info, "binary")).value(), ["id"]));
                    }
                    await Promise.all(tasks);
                } catch (err) {
                    // do nothing
                }

                return resolve();
            });
        },

        /**
         * @param {Object/String} model_info
         * @param {Array} domain
         * @returns {Promise}
         */
        unlink: function (model_info, rc_ids) {
            return new Promise(async (resolve, reject) => {
                try {
                    if (typeof model_info === "string") {
                        model_info = await this._dbmanager.getModelInfo(model_info);
                    }

                    const tasks = [this._dbmanager.deleteRecords(model_info, rc_ids)];
                    // for (const id of rc_ids) {
                    //     tasks.push(this._db.deleteRecords("webclient", "filestore", false, [model, id]));
                    // }
                    await Promise.all(tasks);
                } catch (err) {
                    return reject(err);
                }
                return resolve();
            });
        },

        /**
         * @param {Object/String} model
         * @param {Array} domain
         * @param {Number} limit
         * @param {Number} offset
         * @param {String} orderby (Example: "name DESC, city, sequence ASC")
         * @param {Boolean} lazy
         * @param {Boolean} count
         * @return {Promise[Array[Object]]}
         */
        search: function (
            model_info,
            domain,
            limit,
            offset,
            orderby,
            lazy=true,
            count=false
        ) {
            return new Promise(async (resolve, reject) => {
                try {
                    if (typeof model_info === "string") {
                        model_info = await this._dbmanager.getModelInfo(model_info);
                    }

                    const records = await this._osv.query(model_info, domain, offset, limit, orderby, lazy, count);
                    this._dbmanager._parseValues(model_info.fields, records);
                    if (count) {
                        return resolve(records || 0);
                    } else if (!records) {
                        return resolve([[], -1]);
                    }
                    if (limit === 1) {
                        return resolve(records[0]);
                    }
                    const records_count = records.length;
                    return resolve([records, records_count]);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * @param {Object/String} model
         * @param {Array} domain
         * @param {Number} limit
         * @param {Number} offset
         * @param {String} orderby (Example: "name DESC, city, sequence ASC")
         * @return {Promise[Array[Object]]}
         */
        search_read: function (
            model_info,
            domain,
            limit,
            offset,
            orderby
        ) {
            return new Promise(async (resolve, reject) => {
                try {
                    if (typeof model_info === "string") {
                        model_info = await this._dbmanager.getModelInfo(model_info);
                    }

                    if (limit === 1) {
                        const record = await this.search(model_info, domain, limit, offset, orderby, false);
                        return resolve(record);
                    }

                    const [records, records_count] = await this.search(model_info, domain, limit, offset, orderby, false);
                    return resolve([records, records_count]);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * @param {Object/String} model_info
         * @param {Number/Array[Number]} rc_ids
         * @returns {Promise[Array[Object]]}
         */
        browse: function (model_info, rc_ids) {
            return new Promise(async (resolve, reject) => {
                try {
                    if (typeof model_info === "string") {
                        model_info = await this._dbmanager.getModelInfo(model_info);
                    }

                    const s_rc_ids = (rc_ids instanceof Array)?rc_ids:[rc_ids];
                    const records = await this._dbmanager.getRecords(model_info, s_rc_ids);
                    return resolve(records || []);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * @param {String} model
         * @param {Number/Array[Number]} rc_ids
         * @returns {Promise[Array[Object]]}
         */
        browseBinary: function (model, rc_ids) {
            let s_rc_ids = (rc_ids instanceof Array)?rc_ids:[rc_ids];
            s_rc_ids = _.map(s_rc_ids, (item) => [model, item]);
            return this._db.getRecordsMulti("webclient", "binary", false, s_rc_ids);
        },

                /**
         * @param {Object} model_info
         * @param {Array} domain
         * @returns {Promise}
         */
        count: function (model_info, domain) {
            return this.search(model_info, domain, false, false, false, true, true);
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
                        const model_info = this._dbmanager.getModelInfo("actions", true);
                        record = await this._db.browse(model_info, model_data.res_id);
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
         * @param {Object/String} model
         * @param {Array} fields
         * @param {String} type
         * @returns {Promise}
         */
        getModelFieldsInfo: function (model_info, fields, type) {
            return new Promise(async (resolve, reject) => {
                try {
                    if (typeof model_info === "string") {
                        model_info = await this._dbmanager.getModelInfo(model_info);
                    }

                    const model_fields = JSON.parse(model_info.fields);
                    if (!fields) {
                        fields = _.keys(model_fields);
                    }
                    const field_infos = {};
                    for (let field of fields) {
                        if (!type || model_fields[field].type === type) {
                            field_infos[field] = model_fields[field];
                        }
                    }
                    return resolve(field_infos);
                } catch (err) {
                    return reject();
                }
            });
        },

        /**
         *
         * @param {Object/String} model_info
         * @param {Number} rec_id
         * @returns {Promise}
         */
        isOfflineRecord: function(model_info, rec_id) {
            return new Promise(async resolve => {
                try {
                    if (typeof model_info === "string") {
                        model_info = await this._dbmanager.getModelInfo(model_info);
                    }

                    const model_info_sync = await this._dbmanager.getModelInfo("sync", true);
                    const sync_records = await this.search_read(model_info_sync, [['model', '=', model_info.model], ['method', '=', 'create']]);
                    const record = _.findWhere(sync_records, record => record.args[0].id === rec_id);
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

        /**
         * @param {String} xmlid
         * @returns {Promise}
         */
        getModelData: function (xmlid) {
            return new Promise(async (resolve, reject) => {
                const module_name = xmlid.split(".", 1)[0];
                const name = xmlid.substr(module_name.length + 1);
                try {
                    const records = await this.search_read("ir.model.data", [["module", "=", module_name], ["name", "=", name]], 1);
                    return resolve(records[0]);
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
                    const model_info = this._dbmanager.getModelInfo("defaults", true);
                    const records = await this.search_read(model_info, [["model", "=", model]]);
                    if (_.isEmpty(records)) {
                        return reject();
                    }
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
                    const records = await this.search_read(model, []);
                    const cur_ids = _.map(records, "id");
                    const ids_to_remove = _.difference(oids, cur_ids);
                    this.unlink(model, [["id", "in", ids_to_remove]]);
                    return resolve(ids_to_remove);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * @private
         * @param {Object} model_info
         * @return {Promise}
         */
        _getFieldNamesByType: function (model_info, field_type) {
            return _.chain(model_info.fields).pick((item) => item.type === field_type).keys().value();
        },
    });

    return OdooDatabase;

});
