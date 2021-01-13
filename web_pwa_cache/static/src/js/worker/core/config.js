"use strict";
/* eslint strict: ["error", "global"] */
/* eslint-disable no-undef, no-implicit-globals, no-unused-vars */
/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

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
        this._db = db;
    },

    /**
     * @returns {Boolean}
     */
    isOfflineMode: function () {
        return new Promise(async (resolve) => {
            try {
                const record = await this._db.getRecord("webclient", "config", false, "pwa_mode");
                const is_offline = record?.value === 'offline';
                return resolve(is_offline);
            } catch (err) {
                return resolve(false);
            }
        });
    },

    /**
     * @returns {Boolean}
     */
    isStandaloneMode: function () {
        return new Promise(async (resolve) => {
            try {
                const record = await this._db.getRecord("webclient", "config", false, "standalone");
                return resolve(record?.value);
            } catch (err) {
                return resolve(false);
            }
        });
    },

    /**
     * @returns {Number}
     */
    getUID: function () {
        return new Promise(async (resolve) => {
            try {
                const record = await this._db.getRecord("webclient", "config", false, "uid");
                return resolve(record?.value);
            } catch (err) {
                return resolve(null);
            }
        });
    },

    /**
     * @returns {Number}
     */
    getLang: function () {
        return new Promise(async (resolve) => {
            try {
                const record = await this._db.getRecord("webclient", "config", false, "lang");
                return resolve(record?.value);
            } catch (err) {
                return resolve(null);
            }
        });
    },

    /**
     * @param {String} name
     * @returns {Promise[Any]}
     */
    get: function (name, def_value) {
        return new Promise(async resolve => {
            try {
                const value = (await this._db.getRecord(
                    "webclient", "config", false, name))?.value;
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
                const records = await this._db.getRecords("webclient", "config");
                const config_records = {}
                for (const record of records) {
                    config_records[record.name] = record.value;
                }
                return resolve(config_records);
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
    set: function (name, value) {
        return this._db.createOrUpdateRecord("webclient", "config", false, name, {
            param: name,
            value: value,
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
                const userdata_count = await this._db.countRecords("webclient", "userdata");
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
