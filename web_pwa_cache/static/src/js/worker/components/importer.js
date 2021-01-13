"use strict";
/* eslint strict: ["error", "global"] */
/* eslint-disable no-undef, no-implicit-globals, no-unused-vars */
/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

/**
 * This class is used to store Odoo replies
 * The name of the functions match with the name of the python implementation.
 */
const ComponentImporter = SWComponent.extend({

    /**
     * Used to know if the records need be stored in a independent store.
     * This is used to improve search performance using specific indexes.
     */
    _search_read_independent_model_infos: {
        'ir.model.data': "model_data",
    },

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
    _doCheckCreateOrUpdate: function (store, index, range, values) {
        return new Promise(async (resolve, reject) => {
            if (this.options.allow_create) {
                try {
                    await this._db.createOrUpdateRecord(
                        "webclient",
                        store,
                        index,
                        range,
                        values);
                } catch (err) {
                    // Must create or update... if can't something goes wrong!
                    return reject(err);
                }
            } else {
                try {
                    await this._db.updateRecords(
                        "webclient",
                        store,
                        index,
                        range,
                        values);
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
            tasks.push(this._odoodb.write(model, [record.id], record));
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
        const fields_views = data.fields_views;
        const tasks = [];
        for (const fields_view of fields_views) {
            tasks.push(this._doCheckCreateOrUpdate("views", false, [fields_view.model, fields_view.view_id, fields_view.type], fields_view));
        }
        return Promise.all(tasks);
    },

    /**
     * @param {String} model
     * @param {Object} data
     * @returns {Promise}
     */
    default_get: function (model, data) {
        return this._odoodb.updateModelInfo(model, {defaults: data});
    },

    /**
     * @param {String} model
     * @param {Object} data
     * @returns {Promise}
     */
    load_menus: function (model, data) {
        const values = {
            param: "menus",
            value: data,
        };
        return this._doCheckCreateOrUpdate("userdata", false, "menus", values);
    },

    /**
     * @param {String} model
     * @param {Object} data
     * @returns {Promise}
     */
    read: function (model, data) {
        return this._odoodb.write(model, [data.id], data);
    },

    /**
     * @param {String} model
     * @param {Object} data
     * @param {Object} request_params
     * @returns {Promise}
     */
    read_template: function (model, data, request_params) {
        const xml_ref = request_params.args[0];
        const values = {
            xml_ref: xml_ref,
            template: data,
        };
        return this._doCheckCreateOrUpdate("template", false, xml_ref, values);
    },

    /**
     * @param {String} model
     * @param {Object} data
     * @param {Object} request_params
     * @returns {Promise}
     */
    get_filters: function (model, data, request_params) {
        var fmodel = request_params.args[0];
        return this._odoodb.writeOrCreate(fmodel, data, this.options.allow_create);
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
        // Some models uses an independent store to improve the performance using custom indexes.
        const independent_model_store = this._search_read_independent_model_infos[model];
        if (independent_model_store) {
            return new Promise(async (resolve, reject) => {
                try {
                    const tasks = [];
                    for (const record of records) {
                        tasks.push(this._db.createOrUpdateRecord("webclient", independent_model_store, false, record.id, record));
                    }
                    await Promise.all(tasks);
                } catch(err) {
                    return reject(err);
                }
                return resolve();
            });
        }
        return this._odoodb.writeOrCreate(model, records, this.options.allow_create);
    },

    /**
     * @param {Object} data
     * @returns {Promise}
     */
    action_load: function (data) {
        return this._doCheckCreateOrUpdate("actions", false, data.id, data);
    },

    /**
     * @param {Object} data
     * @returns {Promise}
     */
    translations: function (data) {
        const values = {
            param: "translations",
            value: data,
        };
        return this._doCheckCreateOrUpdate("userdata", false, "translations", values);
    },

    /**
     * Generic handle for post caching response
     *
     * @private
     * @param {String} pathname
     * @param {Object} params
     */
    _generic_post: function (pathname, params, result) {
        const sparams = JSON.stringify(params);
        const values = {
            pathname: pathname,
            params: sparams,
            result: result,
        };
        return this._doCheckCreateOrUpdate("post", false, [pathname, sparams], values);
    },

    /**
     * Generic handle for function calls caching response
     *
     * @private
     * @param {String} pathname
     * @param {Object} params
     */
    _generic_function: function (model, method, result, request_params) {
        const sparams = JSON.stringify(request_params.args);
        const values = {
            model: model,
            method: method,
            params: sparams,
            return: result,
        };
        return this._doCheckCreateOrUpdate("function", false, [model, method, sparams], values);
    },

    /** HELPERS **/

    /**
     * @param {Object} defaults
     * @returns {Promise}
     */
    saveModelInfo: function (model_info) {
        return this._db.createOrUpdateRecord("webclient", "model", false, model_info.model, _.omit(model_info, ["count", "domain", "excluded_fields"]));
    },
});
