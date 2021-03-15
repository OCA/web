/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

 odoo.define("web_pwa_cache.PWA.core.db.IndexedDB", function (require) {
    "use strict";

    var Database = require("web_pwa_cache.PWA.core.db.Database");

    const IndexedDB = Database.extend({
        _db_version: 1,

        /**
         * @override
         */
        init: function () {
            this._super.apply(this, arguments);
            this._db = undefined;
        },

        /**
         * @override
         */
        start: function (onupgradedb) {
            return new Promise(async (resolve, reject) => {
                if (this._db) {
                    return resolve(this._db);
                }
                const db = await new Promise((resolve, reject) => {
                    const dbreq = self.indexedDB.open(this._db_name, this._db_version);
                    dbreq.onsuccess = (evt) => {
                        resolve(evt.target.result);
                    };
                    dbreq.onerror = reject;
                    dbreq.onupgradeneeded = onupgradedb;
                });
                if (!db) {
                    return reject(`Can't create the ${this._db_name} database`);
                }
                this._db = db;
                return resolve(this._db);
            });
        },

        /**
         * @returns {IDBDatabase}
         */
        getDB: function () {
            return this._db;
        },

        /**
         * @param {Array[String]} stores
         * @param {String} mode
         * @returns {IDBObjectStore}
         */
        getObjectStores: function (stores, mode) {
            const transaction = this._db.transaction(stores, mode);
            const res = [];
            for (const store of stores) {
                res.push(transaction.objectStore(store));
            }
            return res;
        },

        /**
         * @param {String} store
         * @param {String} index
         * @param {IDBKeyRange/String} range
         * @returns {Promise[Object]}
         */
        getRecord: function (store, index, range) {
            return new Promise((resolve, reject) => {
                const [objectStore] = this.getObjectStores([store], "readonly");
                if (objectStore) {
                    let query = null;
                    if (index) {
                        query = objectStore.index(index).get(range);
                    } else {
                        query = objectStore.get(range);
                    }
                    query.onsuccess = function (evt) {
                        resolve(evt.target.result);
                    };
                    query.onerror = reject;
                } else {
                    return reject();
                }
            });
        },

        /**
         * @param {String} store
         * @param {String} index
         * @param {IDBKeyRange/String} range
         * @returns {Promise[Object]}
         */
        getRecords: function (store, index, range) {
            return new Promise((resolve, reject) => {
                const [objectStore] = this.getObjectStores([store], "readonly");
                if (objectStore) {
                    let query = null;
                    if (index) {
                        query = objectStore.index(index).getAll(range);
                    } else {
                        query = objectStore.getAll(range);
                    }
                    query.onsuccess = function (evt) {
                        resolve(evt.target.result);
                    };
                    query.onerror = reject;
                } else {
                    return reject();
                }
            });
        },

        /**
         * @param {String} store
         * @param {Any} value
         * @returns {Promise}
         */
        createRecord: function (store, value) {
            return this.createRecords(store, [value]);
        },

        /**
         * @param {String} store
         * @param {Array[Any]} values
         * @returns {Promise}
         */
        createRecords: function (store, values) {
            const [objectStore] = this.getObjectStores([store], "readwrite");
            if (objectStore) {
                const tasks = [];
                for (const value of values) {
                    tasks.push(new Promise((resolve, reject) => {
                        const request = objectStore.add(value);
                        request.onsuccess = resolve;
                        request.onerror = reject;
                    }));
                }
                return Promise.all(tasks);
            }
            return Promise.reject();
        },

        /**
         * @param {String} store
         * @param {Array/String} index
         * @param {IDBKeyRange/String} range
         * @returns {Promise}
         */
        countRecords: function (store, index, range) {
            return new Promise((resolve, reject) => {
                const [objectStore] = this.getObjectStores(
                    [store], "readonly");
                if (objectStore) {
                    let query = null;
                    if (index) {
                        query = objectStore.index(index).count(range);
                    } else {
                    query = objectStore.count(range);
                    }
                    query.onsuccess = function (evt) {
                        resolve(evt.target.result);
                    };
                    query.onerror = reject;
                } else {
                    return reject();
                }
            });
        },

        /**
         * @param {String} store
         * @param {String} index
         * @param {IDBKeyRange/String} range
         * @param {Number/String/Object} value
         * @returns {Promise}
         */
        updateRecords: function (store, index, range, value) {
            return new Promise((resolve, reject) => {
                const [objectStore] = this.getObjectStores(
                    [store], "readwrite");
                if (objectStore) {
                    let query = null;
                    if (index) {
                        query = objectStore.index(index).getAll(range);
                    } else {
                        query = objectStore.getAll(range);
                    }
                    query.onsuccess = function (evt) {
                        if (_.isEmpty(evt.target.result)) {
                            reject();
                        } else {
                            for (const record of evt.target.result) {
                                const nrecord = _.extend(record, value);
                                objectStore.put(nrecord);
                            }
                            resolve();
                        }
                    };
                    query.onerror = reject;
                } else {
                    reject();
                }
            });
        },

        /**
         * @param {String} store
         * @param {String} index
         * @param {IDBKeyRange/String} range
         * @param {Number/String/Object} value
         * @returns {Promise}
         */
        createOrUpdateRecord: function (store, index, range, value) {
            return new Promise(async (resolve, reject) => {
                try {
                    await this.createRecord(store, value);
                    return resolve();
                } catch (err) {
                    try {
                        await this.updateRecords(store, index, range, value);
                        return resolve();
                    } catch (err) {
                        // do nothing
                    }
                }

                return reject();
            });
        },

        /**
         * @param {String} store
         * @param {String} index
         * @param {IDBKeyRange/String} range
         * @returns {Promise}
         */
        deleteRecord: function (store, range) {
            return new Promise(async (resolve, reject) => {
                const [objectStore] = this.getObjectStores(
                    [store], "readwrite");
                if (objectStore) {
                    const request = objectStore.delete(range);
                    request.onsuccess = resolve;
                    request.onerror = reject;
                } else {
                    reject();
                }
            });
        },

        deleteAllRecords: function (store) {
            return new Promise((resolve, reject) => {
                const [objectStore] = this.getObjectStores(
                    [store], "readwrite");
                if (objectStore) {
                    const request = objectStore.clear();
                    request.onsuccess = resolve;
                    request.onerror = reject;
                } else {
                    reject();
                }
            });
        }
    });

    return IndexedDB;
});
