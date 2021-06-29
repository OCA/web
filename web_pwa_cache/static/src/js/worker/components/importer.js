/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_cache.PWA.components.Importer", function(require) {
    "use strict";

    const SWComponent = require("web_pwa_cache.PWA.components.Component");
    const Tools = require("web_pwa_cache.PWA.core.base.Tools");
    const Expression = require("web_pwa_cache.PWA.core.osv.Expression");

    /**
     * This class is used to store Odoo replies
     * The name of the functions match with the name of the python implementation.
     */
    const SWImporterComponent = SWComponent.extend({
        /**
         * @override
         */
        init: function() {
            this._super.apply(this, arguments);
            this.options = {
                allow_create: false,
            };
        },

        /**
         * Helper to check if can create new records
         *
         * @param {Object/String} model_info
         * @param {Object} values
         * @param {Object} conflicts
         * @returns {Promise}
         */
        _doCheckCreateOrUpdate: function(model_info, values, conflicts) {
            return new Promise(async (resolve, reject) => {
                if (this.options.allow_create) {
                    try {
                        await this._db.sqlitedb.createOrUpdateRecord(
                            model_info,
                            values,
                            conflicts
                        );
                    } catch (err) {
                        // Must create or update... if can't something goes wrong!
                        return reject(err);
                    }
                } else {
                    try {
                        const domain = [];
                        for (const field of conflicts) {
                            domain.push([field, "=", values[field]]);
                        }
                        const rc_ids = await this._db.search(model_info, domain);
                        await this._db.write(model_info, rc_ids, values);
                    } catch (err) {
                        // Update can get an error because the record doesn't exists...
                        // do nothing
                    }
                }
                return resolve();
            });
        },

        /**
         * @param {String} model
         * @param {Object} data
         * @returns {Promise}
         */
        name_search: function(model, data) {
            const records = _.map(data, record => {
                return {id: record[0], display_name: record[1]};
            });
            const tasks = [];
            for (const record of records) {
                tasks.push(this._db.write(model, [record.id], record));
            }
            return Promise.all(tasks);
        },

        /**
         * @param {String} model
         * @param {Object} data
         * @returns {Promise}
         */
        name_get: function(model, data) {
            return this.name_search(model, data);
        },

        /**
         * @param {String} model
         * @param {Object} data
         * @returns {Promise}
         */
        load_views: function(model, data) {
            return new Promise(async (resolve, reject) => {
                const fields_views = data.fields_views;
                const tasks = [];
                const model_info_views = await this._db.getModelInfo("views", true);
                for (const fields_view of fields_views) {
                    tasks.push(
                        this._doCheckCreateOrUpdate(model_info_views, fields_view, [
                            "model",
                            "view_id",
                            "type",
                        ])
                    );
                }

                try {
                    await Promise.all(tasks);
                } catch (err) {
                    return reject(err);
                }
                return resolve();
            });
        },

        /**
         * @param {String} model
         * @param {Object} data
         * @returns {Promise}
         */
        default_get: function(model, data) {
            return new Promise(async (resolve, reject) => {
                try {
                    const model_info_metadata = await this._db.getModelInfo(
                        "model_metadata",
                        true
                    );
                    const rc_ids = await this.search(model_info_metadata, [
                        ["model", "=", model],
                    ]);
                    await this._db.sqlitedb.updateModelInfo(rc_ids, {
                        defaults: data,
                    });
                } catch (err) {
                    return reject(err);
                }

                return resolve();
            });
        },

        /**
         * @param {String} model
         * @param {Object} data
         * @returns {Promise}
         */
        load_menus: function(model, data) {
            return new Promise(async (resolve, reject) => {
                const values = {
                    param: "menus",
                    value: data,
                };
                try {
                    const model_info_userdata = await this._db.getModelInfo("userdata", true);
                    await this._doCheckCreateOrUpdate(model_info_userdata, values, [
                        "param",
                    ]);
                } catch (err) {
                    return reject(err);
                }

                return resolve();
            });
        },

        /**
         * @param {String} model
         * @param {Object} data
         * @returns {Promise}
         */
        read: function(model, data) {
            return this._db.write(model, [data.id], data);
        },

        /**
         * @param {String} model
         * @param {Object} data
         * @param {Object} request_params
         * @returns {Promise}
         */
        read_template: function(model, data, request_params) {
            return new Promise(async (resolve, reject) => {
                const xml_ref = request_params.args[0];
                const values = {
                    xml_ref: xml_ref,
                    template: data,
                };

                try {
                    const model_info_template = await this._db.getModelInfo("template", true);
                    await this._doCheckCreateOrUpdate(model_info_template, values, [
                        "xml_ref",
                    ]);
                } catch (err) {
                    return reject(err);
                }

                return resolve();
            });
        },

        /**
         * @param {String} model
         * @param {Object} data
         * @param {Object} request_params
         * @returns {Promise}
         */
        get_filters: function(model, data, request_params) {
            var fmodel = request_params.args[0];
            return this._db.writeOrCreate(fmodel, data, this.options.allow_create);
        },

        /**
         * @param {String} model
         * @param {Object} data
         * @returns {Promise}
         */
        search_read: function(model, data) {
            if (!data) {
                return Promise.resolve();
            }
            return new Promise(async (resolve, reject) => {
                const records = "records" in data ? data.records : data;
                try {
                    const model_info = await this._db.getModelInfo(model);
                    // REMOVE: This is for testing
                    if (model === "pwa.cache.onchange.value") {
                        for (const record of records) {
                            const str_vals = Expression.convert_to_column(model_info.fields.values, Tools.foldObj(JSON.parse(record.values)));
                            record.ref_hash = Tools.hash(`${record.pwa_cache_id[0]}${record.field_name}${str_vals}`);
                        }
                    }
                    await this._db.writeOrCreate(model, records, this.options.allow_create);
                } catch (err) {
                    return reject(err);
                }
                return resolve();
            });
        },

        /**
         * @param {Object} data
         * @returns {Promise}
         */
        action_load: function(data) {
            return new Promise(async (resolve, reject) => {
                try {
                    const model_info_base_actions = await this._db.getModelInfo(
                        "ir.actions.actions"
                    );
                    await this._doCheckCreateOrUpdate(
                        model_info_base_actions,
                        _.pick(data, _.keys(model_info_base_actions.fields)),
                        ["id"]
                    );
                    const model_info_actions = await this._db.getModelInfo(data.type);
                    await this._doCheckCreateOrUpdate(
                        model_info_actions,
                        _.pick(data, _.keys(model_info_actions.fields)),
                        ["id"]
                    );
                } catch (err) {
                    return reject(err);
                }

                return resolve();
            });
        },

        /**
         * Generic handle for post caching response
         *
         * @private
         * @param {String} pathname
         * @param {Object} params
         * @param {Any} result
         * @returns {Promise}
         */
        _generic_post: function(pathname, params, result) {
            return new Promise(async (resolve, reject) => {
                const values = {
                    pathname: pathname,
                    params: params,
                    result: result,
                };

                try {
                    const model_info = await this._db.getModelInfo("post", true);
                    await this._doCheckCreateOrUpdate(model_info, values, [
                        "pathname",
                        "params",
                    ]);
                } catch (err) {
                    return reject(err);
                }

                return resolve();
            });
        },

        /**
         * Generic handle for function calls caching response
         *
         * @private
         * @param {String} model
         * @param {String} method
         * @param {Object} result
         * @param {Object} request_params
         * @returns {Promise}
         */
        _generic_function: function(model, method, result, request_params) {
            return new Promise(async (resolve, reject) => {
                const values = {
                    model: model,
                    method: method,
                    params: request_params.args,
                    return: result,
                };

                try {
                    const model_info_function = await this._db.getModelInfo("function", true);
                    await this._doCheckCreateOrUpdate(model_info_function, values, [
                        "model",
                        "method",
                        "params",
                    ]);
                } catch (err) {
                    return reject();
                }

                return resolve();
            });
        },
    });

    return SWImporterComponent;
});
