"use strict";
/* eslint strict: ["error", "global"] */
/* eslint-disable no-undef, no-implicit-globals, no-unused-vars */
/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

const DatabaseManager = OdooClass.extend({
    _db_version: 3,

    init: function () {
        this._databases = {};
    },

    /**
     * @param {String} db_name
     * @param {Function} onupgradedb
     * @returns {Promise[IDBDatabase]}
     */
    initDatabase: function (db_name, onupgradedb) {
        return new Promise(async (resolve, reject) => {
            if (this._databases[db_name]) {
                return resolve(this._databases[db_name]);
            }
            const db = await new Promise((resolve, reject) => {
                const dbreq = self.indexedDB.open(db_name, this._db_version);
                dbreq.onsuccess = (evt) => {
                    resolve(evt.target.result);
                };
                dbreq.onerror = reject;
                dbreq.onupgradeneeded = onupgradedb;
            });
            if (!db) {
                return reject(`Can't create the ${dn_name} database`);
            }
            this._databases[db_name] = db;
            return resolve(this._databases[db_name]);
        });
    },

    /**
     * @param {String} db_name
     * @returns {IDBDatabase}
     */
    get: function (db_name) {
        return this._databases[db_name];
    },

    /**
     * @param {String} db_name
     * @param {Array[String]} stores
     * @param {String} mode
     * @returns {IDBObjectStore}
     */
    getObjectStores: function (db_name, stores, mode) {
        const db = this.get(db_name);
        if (!db) {
            throw new Error("Database not found");
        }
        const transaction = db.transaction(stores, mode);
        const res = [];
        for (const store of stores) {
            res.push(transaction.objectStore(store));
        }
        return res;
    },

    /**
     * @param {String} db_name
     * @param {String} store
     * @param {String} index
     * @param {IDBKeyRange/String} range
     * @returns {Promise[Object]}
     */
    getRecord: function (db_name, store, index, range) {
        return new Promise((resolve, reject) => {
            const [objectStore] = this.getObjectStores(
                db_name, [store], "readonly");
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
     * @param {String} db_name
     * @param {String} store
     * @param {String} index
     * @param {IDBKeyRange/String} range
     * @returns {Promise[Object]}
     */
    getRecords: function (db_name, store, index, range) {
        return new Promise((resolve, reject) => {
            const [objectStore] = this.getObjectStores(
                db_name, [store], "readonly");
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
     * @param {String} db_name
     * @param {String} store
     * @param {Any} value
     * @returns {Promise}
     */
    createRecord: function (db_name, store, value) {
        return this.createRecords(db_name, store, [value]);
    },

    /**
     * @param {String} db_name
     * @param {String} store
     * @param {Array[Any]} values
     * @returns {Promise}
     */
    createRecords: function (db_name, store, values) {
        const [objectStore] = this.getObjectStores(
            db_name, [store], "readwrite");
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

    countRecords: function (db_name, store) {
        return new Promise((resolve, reject) => {
            const [objectStore] = this.getObjectStores(
                db_name, [store], "readonly");
            if (objectStore) {
                const query = objectStore.count();
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
     * @param {String} db_name
     * @param {String} store
     * @param {String} index
     * @param {IDBKeyRange/String} range
     * @param {Number/String/Object} value
     * @returns {Promise}
     */
    updateRecords: function (db_name, store, index, range, value) {
        return new Promise((resolve, reject) => {
            const [objectStore] = this.getObjectStores(
                db_name, [store], "readwrite");
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
     * @param {String} db_name
     * @param {String} store
     * @param {String} index
     * @param {IDBKeyRange/String} range
     * @param {Number/String/Object} value
     * @returns {Promise}
     */
    createOrUpdateRecord: function (db_name, store, index, range, value) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.createRecord(db_name, store, value);
                return resolve();
            } catch (err) {
                try {
                    await this.updateRecords(db_name, store, index, range, value);
                    return resolve();
                } catch (err) {
                    // do nothing
                }
            }

            return reject();
        });
    },

    /**
     * @param {String} db_name
     * @param {String} store
     * @param {String} index
     * @param {IDBKeyRange/String} range
     * @returns {Promise}
     */
    deleteRecords: function (db_name, store, index, range) {
        return new Promise((resolve, reject) => {
            const [objectStore] = this.getObjectStores(
                db_name, [store], "readwrite");
            if (objectStore) {
                let request = null;
                if (index) {
                    request = objectStore.index(index).delete(range);
                } else {
                    request = objectStore.delete(range);
                }
                request.onsuccess = resolve;
                request.onerror = reject;
            } else {
                reject();
            }
        });
    },

    deleteAllRecords: function (db_name, store, reset_object_store) {
        return new Promise((resolve, reject) => {
            const [objectStore] = this.getObjectStores(
                db_name, [store], "readwrite");
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
