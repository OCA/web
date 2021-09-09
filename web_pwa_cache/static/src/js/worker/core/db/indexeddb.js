/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_cache.PWA.core.db.IndexedDB", function(require) {
    "use strict";

    var Database = require("web_pwa_cache.PWA.core.db.Database");

    const IndexedDB = Database.extend({
        _db_version: 1,

        /**
         * @override
         */
        init: function() {
            this._super.apply(this, arguments);
            this._db = undefined;
        },

        /**
         * @override
         */
        start: function(onupgradedb) {
            return new Promise(async (resolve, reject) => {
                if (this._db) {
                    return resolve(this._db);
                }
                const db = await new Promise((resolve_db, reject_db) => {
                    const dbreq = self.indexedDB.open(this._db_name, this._db_version);
                    dbreq.onsuccess = evt => {
                        resolve_db(evt.target.result);
                    };
                    dbreq.onerror = reject_db;
                    dbreq.onupgradeneeded = onupgradedb;
                });
                if (!db) {
                    return reject(`Can't create the ${this._db_name} database`);
                }
                this._db = db;
                return resolve(this._db);
            });
        },

        close: function() {
            this._db.close();
            this._db = undefined;
        },

        /**
         * @returns {IDBDatabase}
         */
        getDB: function() {
            return this._db;
        },

        /**
         * @param {String} store
         * @param {String} mode
         * @returns {IDBObjectStore}
         */
        getTransactionInfo: function(store, mode) {
            const transaction = this._db.transaction(store, mode);
            const objectStore = transaction.objectStore(store);
            return [transaction, objectStore];
        },

        /**
         * @param {String} store
         * @param {String} index
         * @param {IDBKeyRange/String} range
         * @returns {Promise}
         */
        getRecord: function(store, index, range) {
            return new Promise((resolve, reject) => {
                const [transaction, objectStore] = this.getTransactionInfo(
                    store,
                    "readonly"
                );
                if (transaction && objectStore) {
                    let request = false;
                    if (index) {
                        request = objectStore.index(index).get(range);
                    } else {
                        request = objectStore.get(range);
                    }
                    transaction.commit();
                    request.onsuccess = evt => {
                        resolve(evt.target.result);
                    };
                    request.onerror = reject;
                } else {
                    return reject();
                }
            });
        },

        /**
         * @param {String} store
         * @param {String} index
         * @param {IDBKeyRange/String} range
         * @returns {Promise}
         */
        getRecords: function(store, index, range) {
            return new Promise((resolve, reject) => {
                const [transaction, objectStore] = this.getTransactionInfo(
                    store,
                    "readonly"
                );
                if (objectStore) {
                    let request = false;
                    if (index) {
                        request = objectStore.index(index).getAll(range);
                    } else {
                        request = objectStore.getAll(range);
                    }
                    transaction.commit();
                    request.onsuccess = evt => {
                        resolve(evt.target.result);
                    };
                    request.onerror = reject;
                } else {
                    return reject();
                }
            });
        },

        /**
         * @param {String} store
         * @param {Object} value
         * @returns {Promise}
         */
        createRecord: function(store, value) {
            return this.createRecords(store, [value]);
        },

        /**
         * @param {String} store
         * @param {Array} values
         * @returns {Promise}
         */
        createRecords: function(store, values) {
            return new Promise((resolve, reject) => {
                const [transaction, objectStore] = this.getTransactionInfo(
                    store,
                    "readwrite"
                );
                if (objectStore) {
                    for (const value of values) {
                        objectStore.add(value);
                    }
                    transaction.commit();
                    transaction.oncomplete = resolve;
                    transaction.onerror = reject;
                    transaction.onabort = reject;
                } else {
                    return reject();
                }
            });
        },

        /**
         * @param {String} store
         * @param {Array/String} index
         * @param {IDBKeyRange/String} range
         * @returns {Promise}
         */
        countRecords: function(store, index, range) {
            return new Promise((resolve, reject) => {
                const [transaction, objectStore] = this.getTransactionInfo(
                    store,
                    "readonly"
                );
                if (objectStore) {
                    let request = false;
                    if (index) {
                        request = objectStore.index(index).count(range);
                    } else {
                        request = objectStore.count(range);
                    }
                    transaction.commit();
                    request.onsuccess = evt => {
                        resolve(evt.target.result);
                    };
                    request.onerror = reject;
                } else {
                    return reject();
                }
            });
        },

        /**
         * @param {String} store
         * @param {Object} value
         * @returns {Promise}
         */
        createOrUpdateRecord: function(store, value) {
            return this.createOrUpdateRecords(store, [value]);
        },

        /**
         * @param {String} store
         * @param {Array} values
         * @returns {Promise}
         */
        createOrUpdateRecords: function(store, values) {
            return new Promise((resolve, reject) => {
                const [transaction, objectStore] = this.getTransactionInfo(
                    store,
                    "readwrite"
                );
                if (objectStore) {
                    for (const value in values) {
                        objectStore.put(value);
                    }
                    transaction.commit();
                    transaction.oncomplete = resolve;
                    transaction.onerror = reject;
                    transaction.onabort = reject;
                } else {
                    reject();
                }
            });
        },

        /**
         * @param {String} store
         * @param {IDBKeyRange/String} range
         * @returns {Promise}
         */
        deleteRecord: function(store, range) {
            return new Promise((resolve, reject) => {
                const [transaction, objectStore] = this.getTransactionInfo(
                    store,
                    "readwrite"
                );
                if (objectStore) {
                    objectStore.delete(range);
                    transaction.commit();
                    transaction.oncomplete = resolve;
                    transaction.onerror = reject;
                    transaction.onabort = reject;
                } else {
                    reject();
                }
            });
        },

        deleteAllRecords: function(store) {
            return new Promise((resolve, reject) => {
                const [transaction, objectStore] = this.getTransactionInfo(
                    store,
                    "readwrite"
                );
                if (objectStore) {
                    objectStore.clear();
                    transaction.commit();
                    transaction.oncomplete = resolve;
                    transaction.onerror = reject;
                    transaction.onabort = reject;
                } else {
                    reject();
                }
            });
        },
    });

    return IndexedDB;
});
