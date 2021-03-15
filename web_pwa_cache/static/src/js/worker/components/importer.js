/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_cache.PWA.components.Importer", function (require) {
    "use strict";

    const SWComponent = require('web_pwa_cache.PWA.components.SWComponent');

    /**
     * This class is used to store Odoo replies
     * The name of the functions match with the name of the python implementation.
     */
    const ComponentImporter = SWComponent.extend({

        /**
         * @override
         */
        init: function () {
            this._super.apply(this, arguments);
            this.options = {
                allow_create: false,
            }
        },

        /**
         * Helper to check if can create new records
         *
         * @param {String} store
         * @param {String} index
         * @param {IDBKeyRange} range
         * @param {Object} values
         */
        _doCheckCreateOrUpdate: function (model_info, values, conflicts) {
            return new Promise(async (resolve, reject) => {
                if (this.options.allow_create) {
                    try {
                        await this._dbmanager.sqlitedb.createOrUpdateRecord(model_info, values, conflicts);
                    } catch (err) {
                        // Must create or update... if can't something goes wrong!
                        return reject(err);
                    }
                } else {
                    try {
                        const domain = [];
                        for (let field of conflicts) {
                            domain.push([field, "=", values[field]]);
                        }
                        const rc_ids = await this._dbmanager.search(model_info, domain)
                        await this._dbmanager.write(model_info, rc_ids, values);
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
        name_search: function (model, data) {
            const records = _.map(data, (record) => {
                return {id: record[0], display_name: record[1]};
            });
            const tasks = [];
            for (const record of records) {
                tasks.push(this._dbmanager.write(model, [record.id], record));
            }
            return Promise.all(tasks);
        },

        /**
         * @param {String} model
         * @param {Object} data
         * @returns {Promise}
         */
        name_get: function (model, data) {
            return this.name_search(model, data);
        },

        /**
         * @param {String} model
         * @param {Object} data
         * @returns {Promise}
         */
        load_views: function (model, data) {
            return new Promise(async (resolve, reject) => {
                const fields_views = data.fields_views;
                const tasks = [];
                for (const fields_view of fields_views) {
                    tasks.push(this._doCheckCreateOrUpdate(model_info_views, fields_view, ["model", "view_id", "type"]));
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
        default_get: function (model, data) {
            return new Promise(async (resolve, reject) => {
                try {
                    const model_info_metadata = await this._dbmanager.sqlitedb.getModelInfo("model_metadata", true);
                    const rc_ids = await this.search(model_info_metadata, [["model", "=", model]]);
                    await this._dbmanager.sqlitedb.updateModelInfo(rc_ids, {defaults: data});
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
        load_menus: function (model, data) {
            return new Promise(async (resolve, reject) => {
                const values = {
                    param: "menus",
                    value: data,
                };
                try {
                    const model_info_userdata = await this._dbmanager.sqlitedb.getModelInfo("userdata", true);
                    await this._doCheckCreateOrUpdate(model_info_userdata, values, ["param"]);
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
        read: function (model, data) {
            return this._dbmanager.write(model, [data.id], data);
        },

        /**
         * @param {String} model
         * @param {Object} data
         * @param {Object} request_params
         * @returns {Promise}
         */
        read_template: function (model, data, request_params) {
            return new Promise(async (resolve, reject) => {
                const xml_ref = request_params.args[0];
                const values = {
                    xml_ref: xml_ref,
                    template: data,
                };

                try {
                    const model_info_template = await this._dbmanager.sqlitedb.getModelInfo("template", true);
                    await this._doCheckCreateOrUpdate(model_info_template, values, ["xml_ref"]);
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
        get_filters: function (model, data, request_params) {
            var fmodel = request_params.args[0];
            return this._dbmanager.writeOrCreate(fmodel, data, this.options.allow_create);
        },

        /**
         * @param {String} model
         * @param {Object} data
         * @param {String} domain
         */
        search_read: function (model, data, domain) {
            if (!data) {
                return Promise.resolve();
            }
            const records = ("records" in data)?data.records:data;
            return this._dbmanager.writeOrCreate(model, records, this.options.allow_create);
        },

        /**
         * @param {Object} data
         * @returns {Promise}
         */
        action_load: function (data) {
            return new Promise(async (resolve, reject) => {
                try {
                    const model_info_actions = await this._dbmanager.sqlitedb.getModelInfo("actions", true);
                    await this._doCheckCreateOrUpdate(model_info_actions, data, ["id"]);
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
        translations: function (data) {
            return new Promise(async (resolve, reject) => {
                const values = {
                    param: "translations",
                    value: data,
                };

                try {
                    const model_info_userdata = await this._dbmanager.sqlitedb.getModelInfo("userdata", true);
                    await this._doCheckCreateOrUpdate(model_info_userdata, values, ["param"]);
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
         */
        _generic_post: function (pathname, params, result) {
            return new Promise(async (resolve, reject) => {
                const values = {
                    pathname: pathname,
                    params: params,
                    result: result,
                };

                try {
                    const model_info = await this._dbmanager.sqlitedb.getModelInfo("post", true);
                    await this._doCheckCreateOrUpdate(model_info, values, ["pathname","params"]);
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
         * @param {String} pathname
         * @param {Object} params
         * @return {Promise}
         */
        _generic_function: function (model, method, result, request_params) {
            return new Promise (async (resolve, reject) => {
                const values = {
                    model: model,
                    method: method,
                    params: request_params.args,
                    return: result,
                };

                try {
                    const model_info_function = await this._dbmanager.sqlitedb.getModelInfo("function", true);
                    await this._doCheckCreateOrUpdate(model_info_function, values, ["model", "method", "params"]);
                } catch (err) {
                    return reject();
                }

                return resolve();
            });
        },
    });

    return ComponentImporter;

});
