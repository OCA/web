/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_cache.PWA.core.Config", function (require) {
    "use strict";

    const ParentedMixin = require('web.mixins').ParentedMixin;
    const OdooClass = require("web.Class");


    /**
     * This class is used to store pwa configuration parameters
     */
    const Config = OdooClass.extend(ParentedMixin, {

        /**
         * @param {OdooClass} parent
         * @param {DatabaseManagerClass} db
         */
        init: function (parent, db) {
            ParentedMixin.init.call(this);
            this.setParent(parent);
            this._db = this.getParent()._db;
            this._itp = this.getParent()._dbmanager.sqlitedb._internal_table_prefix;
            this._dbmanager = this.getParent()._dbmanager;
            this._cache = {};
        },

        /**
         * @returns {Boolean}
         */
        isOfflineMode: function () {
            return this._cache.pwa_mode;
        },

        /**
         * @returns {Boolean}
         */
        isStandaloneMode: function () {
            return this._cache.standalone;
        },

        /**
         * @returns {Number}
         */
        getUID: function () {
            return this._cache.lang;
        },

        /**
         * @returns {Number}
         */
        getLang: function () {
            return this._cache.lang;
        },

        /**
         * @param {String} name
         * @returns {Promise[Any]}
         */
        get: function (name, def_value) {
            return new Promise(async resolve => {
                try {
                    const model_info_config = await this._dbmanager.sqlitedb.getModelInfo("config", true);
                    const record = await this._dbmanager.search_read(model_info_config, [["param", "=", name]], 1);
                    const value = record?.value;
                    this._cache[record.param] = record?.value;
                    return resolve(typeof value === 'undefined' ? def_value : value);
                } catch (err) {
                    return resolve(null);
                }
            });
        },

        /**
         * @returns {Promise[Object]}
         */
        getAll: function () {
            return new Promise(async (resolve, reject) => {
                try {
                    const model_info_config = await this._dbmanager.sqlitedb.getModelInfo("config", true);
                    const records = await this._dbmanager.search_read(model_info_config, []);
                    this._cache = {};
                    for (const record of records) {
                        this._cache[record.param] = record.value;
                    }
                    return resolve(this._cache);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * @param {String} name
         * @param {Any} value
         * @returns {Promise}
         */
        set: function (param, value) {
            return new Promise(async (resolve, reject) => {
                try {
                    const model_info_config = await this._dbmanager.sqlitedb.getModelInfo("config", true);
                    await this._dbmanager.sqlitedb.createOrUpdateRecord(model_info_config, {
                        param: param,
                        value: value,
                    }, ['param']);
                    this._cache[param] = value;
                } catch (err) {
                    return reject();
                }

                return resolve();
            });
        },

        /**
         * Send configuration state to the client pages
         *
         * @private
         * @returns {Promise}
         */
        sendToClient: function () {
            return new Promise(async (resolve, reject) => {
                try {
                    const config = await this.getAll();
                    const model_info_userdata = await this._dbmanager.sqlitedb.getModelInfo("userdata", true);
                    const userdata_count = await this._dbmanager.count(model_info_userdata);
                    config.is_db_empty = userdata_count === 0;
                    this.getParent().postClientPageMessage({
                        type: "PWA_INIT_CONFIG",
                        data: config,
                    });
                    this.getParent()._components.sync.updateClientCount();
                } catch (err) {
                    return reject(err);
                }
                return resolve();
            });
        },
    });

    return Config;

});
