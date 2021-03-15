/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_cache.PWA.components.Sync", function (require) {
    "use strict";

    const SWComponent = require('web_pwa_cache.PWA.components.SWComponent');


    /**
     * This class is used to manage sync operations
     */
    const ComponentSync = SWComponent.extend({

        /**
         * @returns {Promise}
         */
        getSyncRecords: function() {
            return new Promise(async (resolve) => {
                try {
                    const model_info_sync = await this._dbmanager.sqlitedb.getModelInfo("sync", true);
                    const records = await this._dbmanager.search_read(model_info_sync, []);
                    return resolve(records);
                } catch (err) {
                    // do nothing
                }

                return resolve([]);
            });
        },

        /**
         * @param {Number} key
         * @param {Object} data
         * @returns {Promise}
         */
        updateSyncRecord: function (key, data) {
            return new Promise((resolve, reject) => {
                const [objectStore] = this._db.getObjectStores("webclient", ["sync"], "readwrite");
                if (objectStore) {
                    const cursor = objectStore.openCursor();
                    cursor.onsuccess = function(evt) {
                        var cursor = evt.target.result;
                        if (cursor) {
                            if (cursor.key === key) {
                                cursor.update(_.extend(cursor.value,data));
                                resolve();
                            } else {
                                cursor.continue();
                            }
                        } else {
                            reject();
                        }
                    };
                    cursor.onerror = function() {
                        reject();
                    };
                } else {
                    reject();
                }
            });
        },

        /**
         * @param {Array[Number]} keys
         * @returns {Promise}
         */
        removeSyncRecords: function (keys) {
            return new Promise((resolve, reject) => {
                const [objectStore] = this._db.getObjectStores("webclient", ["sync"], "readwrite");
                if (objectStore) {
                    const cursor = objectStore.openCursor();
                    cursor.onsuccess = function(evt) {
                        var cursor = evt.target.result;
                        if (cursor) {
                            if (keys.indexOf(cursor.key) !== -1) {
                                cursor.delete();
                            }
                            cursor.continue();
                        } else {
                            resolve();
                        }
                    };
                    cursor.onerror = function() {
                        reject();
                    };
                } else {
                    reject();
                }
            });
        },

        _updateIds: function (records, old_id, new_id) {
            // Update sync records
            const tasks = [];
            for (const record of records) {
                // Update values
                const record_values = record.value.args[0];
                for (const field_name in record_values) {
                    const field_value = record_values[field_name];
                    if (field_value instanceof Array) {
                        for (const value of field_value) {
                            if (value === old_id) {
                                value = new_id;
                            }
                        }
                        record_values[field_name] = field_value;
                    } else if (field_value === old_id) {
                        record_values[field_name] = field_value;
                    }
                }
                record.value.args[0] = record_values;
                // Update linked info
                for (const model in record.value.linked) {
                    const changes = record.value.linked[model];
                    for (const index in changes) {
                        const change = changes[index];
                        if (change.id === old_id) {
                            change.id = new_id;
                        }
                        if (change.change === old_id) {
                            change.change = new_id;
                        }

                        record.value.linked[model][index] = change;
                    }

                }
                tasks.push(this.updateSyncRecord(record.key, record.value));
            }
            return Promise.all(tasks);
        },

        /**
         * Send transactions to synchronize to Odoo
         * If one fails, all the process will be aborted.
         *
         * @private
         * @returns {Promise}
         */
        run: function () {
            return new Promise(async (resolve, reject) => {
                try {
                    const sync_keys_done = [];
                    const records = await this.getSyncRecords();
                    if (records.length) {
                        this.sendRecordsToClient(true);
                    }
                    for (const index in records) {
                        const key = records[index].key;
                        const record = records[index].value;
                        let s_args = record.args;
                        // Remove generated client ids to be generated by server side
                        if (record.method === "create") {
                            const [response_s, request_data_s] = await this._rpc.callJSonRpc(
                                record.model,
                                'default_get',
                                s_args,
                                record.kwargs
                            );
                            const defaults = (await response_s.json()).result;
                            s_args = _.map(record.args, (item) => {
                                const values = _.omit(item, ["id", "display_name"]);
                                if (values.name) {
                                    values.name = values.name.replace(/\s?\(Offline Record #\d+\)/, "");
                                }
                                for (const key in values) {
                                    if (!values[key] && key in defaults) {
                                        values[key] = defaults[key];
                                    }
                                }
                                return values;
                            });
                        }
                        let response = false,
                            request_data = false;
                        try {
                            [response, request_data] = await this._rpc.callJSonRpc(
                                record.model,
                                record.method,
                                s_args,
                                record.kwargs
                            );
                        } catch (err) {
                            console.log(
                                "[ServiceWorker] Error: can't synchronize the current record. Aborting!"
                            );
                            await this.updateSyncRecord(key, {failed: true});
                            break;
                        }
                        // Propagate the new id to the rest of the records
                        if (record.method === "create") {
                            const response_clone = response.clone();
                            const data = await response_clone.json();
                            const new_ids =
                                typeof data.result === "number" ? [data.result] : data.result;
                            for (const index_b in new_ids) {
                                const new_id = new_ids[index_b];
                                const old_id = record.args[index_b].id;
                                // updateIds can not found the key... so is normal get fails here
                                try {
                                    await this._updateIds(records, old_id, new_id);
                                } catch (err) {
                                    // do nothing
                                }
                                // Update linked records
                                const linked_models = Object.keys(record.linked)
                                for (const model of linked_models) {
                                    const changes = record.linked[model];
                                    for (const change of changes) {
                                        // Update normal records
                                        const model_records = await this._dbmanager.browse(
                                            model,
                                            change.id
                                        );
                                        if (_.isEmpty(model_records)) {
                                            continue;
                                        }
                                        const model_record = model_records[0];
                                        let field = model_record[change.field];
                                        if (typeof field === 'object') {
                                            field = _.map(field, (item) => {
                                                if (item === change.change) { return new_id; }
                                                return item;
                                            });
                                        } else {
                                            field = new_id;
                                        }
                                        model_record[change.field] = field;
                                        await this._dbmanager.unlink(model, [change.id]);
                                        await this._dbmanager.create(model, model_record);

                                        // Update sync records
                                        for (const def_sync of records) {
                                            const srecord = def_sync.value;
                                            if (srecord.model !== model) {
                                                continue;
                                            }
                                            //if (srecord.id)
                                            for (const record_sync of srecord.args) {
                                                let field = record_sync[change.field];
                                                if (typeof field === 'object') {
                                                    field = _.map(field, (item) => {
                                                        if (item === change.change) { return new_id; }
                                                        return item;
                                                    });
                                                } else {
                                                    field = new_id;
                                                }
                                                record_sync[change.field] = field;
                                            }
                                        }
                                    }
                                }

                                const old_records = await this._dbmanager.browse(
                                    record.model,
                                    old_id
                                );
                                old_records[0].id = new_id;
                                await this._dbmanager.unlink(record.model, [old_id]);
                                await this._dbmanager.create(record.model, old_records[0]);
                            }
                        }
                        await this.removeSyncRecords([key]);
                        sync_keys_done.push(key);
                        this._sendRecordOK(index);
                    }
                } catch (err) {
                    return reject(err);
                }

                this.updateClientCount();
                this._sendRecordsCompleted();
                return resolve();
            });
        },

        /**
         * Send transactions to synchronize to the client pages
         * This will open a dialog to display the transactions.
         *
         * @param {Boolean} forced_sync
         * @returns {Promise}
         */
        sendRecordsToClient: function (forced_sync = false) {
            return this.getSyncRecords().then((records) => {
                this.getParent().postClientPageMessage({
                    type: "PWA_SYNC_RECORDS",
                    records: records,
                    forced_sync: forced_sync
                });
            });
        },

        /**
         * This will update the counter of transactions to synchronize on the
         * client pages.
         *
         * @returns {Promise}
         */
        updateClientCount: function () {
            return this.getSyncRecords().then((records) => {
                this.getParent().postClientPageMessage({
                    type: "PWA_SYNC_RECORDS_COUNT",
                    count: records.length,
                });
            });
        },


        /**
         * Send correct sync process to the client pages
         *
         * @private
         * @params {Number} index
         */
        _sendRecordOK: function (index) {
            this.getParent().postClientPageMessage({
                type: "PWA_SYNC_RECORD_OK",
                index: index,
            });
        },

        /**
         * Send completed sync. tasks
         *
         * @private
         */
        _sendRecordsCompleted: function () {
            this.getParent().postClientPageMessage({
                type: "PWA_SYNC_RECORDS_COMPLETED",
            });
        },
    });

    return ComponentSync;

});
