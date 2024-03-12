/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_cache.PWA.managers.Sync", function(require) {
    "use strict";

    const SWManager = require("web_pwa_cache.PWA.managers.Manager");
    const rpc = require("web_pwa_cache.PWA.core.base.rpc");
    const BroadcastMixin = require("web_pwa_cache.BroadcastMixin");

    /**
     * This class is used to manage sync operations
     */
    const SWSyncManager = SWManager.extend(BroadcastMixin, {
        /**
         * @override
         */
        init: function() {
            this.init_broadcast("pwa-sw-messages", "pwa-page-messages");
            this._super.apply(this, arguments);
        },

        /**
         * @override
         */
        start: function() {
            return this.sendCountToPages();
        },

        /**
         * @returns {Promise}
         */
        getSyncRecords: function() {
            return this._db.indexeddb.sync.toArray();
        },

        /**
         * @param {Number} key
         * @param {Object} data
         * @returns {Promise}
         */
        updateSyncRecord: function(id, data) {
            return this._db.indexeddb.sync.put(_.extend({}, data, {id: id}));
        },

        /**
         * @param {Array[Number]} keys
         * @returns {Promise}
         */
        removeSyncRecords: function(ids) {
            return this._db.indexeddb.sync
                .where("id")
                .anyOf(ids)
                .delete();
        },

        _updateIds: function(sync_records, model, old_id, new_id) {
            const get_index_init = method => {
                if (method === "create") {
                    return 0;
                } else if (method === "write") {
                    return 1;
                }
                return -1;
            };

            return new Promise(async (resolve, reject) => {
                try {
                    for (const record of sync_records) {
                        const sync_model_info = await this._db.getModelInfo(
                            record.model
                        );
                        let need_update_sync = false;
                        // Update sync. record values
                        if (
                            record.model === model &&
                            (record.method === "write" || record.method === "unlink")
                        ) {
                            // Operations are always unitary
                            if (
                                record.method === "write" &&
                                record.args[0][0] === old_id
                            ) {
                                record.args[0][0] = new_id;
                            } else if (
                                record.method === "unlink" &&
                                record.args[0][0][0] === old_id
                            ) {
                                record.args[0][0][0] = new_id;
                            }
                            need_update_sync = true;
                        }
                        const values_index = get_index_init(record.method);
                        if (values_index === -1) {
                            continue;
                        }

                        let need_update_db = false;
                        const values = record.args[values_index];
                        const sync_old_id = values.id;
                        for (const field in values) {
                            const field_value = values[field];
                            if (
                                field === "id" &&
                                record.model === model &&
                                field_value === old_id
                            ) {
                                values[field] = new_id;
                                need_update_db = true;
                                continue;
                            }
                            const field_info = sync_model_info.fields[field];
                            if (!field_info || field_info.relation !== model) {
                                continue;
                            }
                            if (field_value === old_id) {
                                values[field] = new_id;
                                need_update_db = true;
                            } else if (
                                field_value instanceof Array &&
                                field_value.indexOf(old_id) !== -1
                            ) {
                                values[field] = _.map(field_value, value =>
                                    value === old_id ? new_id : value
                                );
                                need_update_db = true;
                            }
                        }

                        // Recreate the offline record with the new ids
                        if (need_update_db) {
                            try {
                                if (record.method === "create") {
                                    // Create generates a new id
                                    await this._db.unlink(record.model, [sync_old_id]);
                                    await this._db.writeOrCreate(record.model, [
                                        values,
                                    ]);
                                } else if (record.method === "write") {
                                    // Write can update the current record
                                    await this._db.write(
                                        record.model,
                                        record.args[0],
                                        values
                                    );
                                }
                            } catch (err) {
                                return reject(err);
                            }
                        }

                        // Update linked info
                        for (const linked_model in record.linked) {
                            const linked_infos = record.linked[linked_model];
                            const linked_model_info = await this._db.getModelInfo(
                                linked_model
                            );
                            for (const linked_info of linked_infos) {
                                if (
                                    linked_model === model &&
                                    linked_info.change === old_id
                                ) {
                                    linked_info.change = new_id;
                                    need_update_sync = true;
                                }
                                if (linked_info.id !== old_id) {
                                    continue;
                                }
                                const linked_field_info =
                                    linked_model_info.fields[linked_info.field];
                                if (
                                    !linked_field_info ||
                                    linked_field_info.relation !== model
                                ) {
                                    continue;
                                }
                                linked_info.id = new_id;
                                need_update_sync = true;
                            }
                        }

                        if (need_update_db || need_update_sync) {
                            await this.updateSyncRecord(
                                record.id,
                                _.extend(record, {failed: false})
                            );
                        }
                    }
                } catch (err) {
                    return reject(err);
                }
                return resolve();
            });
        },

        /**
         * Process create record values:
         *  - Unset temporal ids
         *  - Unset temporal names
         *  - Update default values
         *
         * @param {Object} record
         */
        _prepareRecordValues: function(record) {
            return new Promise(async (resolve, reject) => {
                if (record.method === "create") {
                    const s_values = _.omit(record.args[0], ["id", "display_name"]);
                    if (s_values.name) {
                        s_values.name = s_values.name.replace(
                            /\s?\(?Offline Record #\d+\)?/,
                            ""
                        );
                    }
                    try {
                        const [response_s] = await rpc.callJSonRpc(
                            record.model,
                            "default_get",
                            [Object.keys(s_values)],
                            record.kwargs
                        );
                        const defaults = (await response_s.json()).result;
                        if (!_.isEmpty(defaults)) {
                            for (const key in s_values) {
                                if (!s_values[key] && key in defaults) {
                                    s_values[key] = defaults[key];
                                }
                            }
                        }
                    } catch (err) {
                        return reject(err);
                    }
                    return resolve([s_values]);
                } else if (record.method === "write") {
                    const s_values = _.omit(record.args[1], ["id", "display_name"]);
                    if (s_values.name) {
                        s_values.name = s_values.name.replace(
                            /\s?\(?Offline Record #\d+\)?/,
                            ""
                        );
                    }
                    return resolve([record.args[0], s_values]);
                } else if (record.method === "unlink") {
                    return resolve(record.args[0]);
                }
                return reject();
            });
        },

        _postProcessCreateRecord: function(sync_records, cur_record, values, new_id) {
            return new Promise(async (resolve, reject) => {
                const old_id = cur_record.args[0].id;
                try {
                    const model_info = await this._db.getModelInfo(cur_record.model);
                    // Ensure that the record have the correct 'log_access_fields'
                    if (model_info.has_log_fields) {
                        await rpc.callJSonRpc(
                            cur_record.model,
                            "write",
                            [
                                [new_id],
                                {
                                    create_date: values[0].create_date,
                                },
                            ],
                            cur_record.kwargs
                        );
                    }

                    // Update current record ids
                    await this._updateIds(
                        [cur_record],
                        model_info.model,
                        old_id,
                        new_id
                    );
                    // Propagate the new id to the rest of the records
                    await this._updateIds(
                        sync_records,
                        model_info.model,
                        old_id,
                        new_id
                    );
                } catch (err) {
                    return reject(err);
                }
                return resolve();
            });
        },

        /**
         * @param {Object} record
         */
        _processRecord: function(cur_record, values) {
            return new Promise(async (resolve, reject) => {
                // Send the request to Odoo
                try {
                    // Sync. operations are allways unitary
                    const [response] = await rpc.callJSonRpc(
                        cur_record.model,
                        cur_record.method,
                        values,
                        cur_record.kwargs
                    );
                    const result = (await response.json()).result;
                    if (typeof result === "undefined") {
                        // Unlink operations doesn't give any "result"
                        return resolve(true);
                    }
                    return resolve(result);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * Send transactions to synchronize to Odoo
         * If one fails, all the process will be aborted.
         *
         * @private
         * @returns {Promise}
         */
        run: function() {
            return new Promise(async (resolve, reject) => {
                let error_msg = false;
                try {
                    const sync_records_done = [];
                    const sync_records = await this.getSyncRecords();
                    if (sync_records.length) {
                        this.sendRecordsToPages(true);
                    }
                    // Sync. records are processed one by one due to
                    // 'create' operation generates ids that can be used
                    // by the rest of the records
                    // TODO: Implement a 'cleanup' operation, for example,
                    // to avoid 'create' records thats have an 'unlink'
                    // operation.
                    while (sync_records.length) {
                        const record = sync_records.shift();
                        try {
                            const values = await this._prepareRecordValues(record);
                            const result = await this._processRecord(record, values);
                            if (result === true || (_.isNumber(result) && result > 0)) {
                                sync_records_done.push(record);
                                this._sendRecordOKToPages(record.id);
                                if (record.method === "create") {
                                    await this._postProcessCreateRecord(
                                        sync_records,
                                        record,
                                        values,
                                        result
                                    );
                                }
                            } else if (
                                !_.isEmpty(result) &&
                                Object.prototype.hasOwnProperty.call(result, "error") &&
                                Object.prototype.hasOwnProperty.call(
                                    result.error,
                                    "data"
                                )
                            ) {
                                error_msg = `Unsatisfactory response from server: ${result.error.data.message}`;
                            } else {
                                error_msg =
                                    "Unsatisfactory response from server. No more details given.";
                            }
                        } catch (err) {
                            console.log(err);
                            error_msg = err;
                        }
                        if (error_msg) {
                            await this.updateSyncRecord(
                                record.id,
                                _.extend(record, {failed: true})
                            );
                            sync_records.unshift(record);
                            this._sendRecordFailToPages(record.id, error_msg);
                            break;
                        }
                    }
                    await this.onSynchronizedRecords(
                        sync_records_done,
                        error_msg !== false
                    );
                } catch (err) {
                    console.log(err);
                    error_msg = err;
                }
                this.sendCountToPages();
                if (error_msg) {
                    return reject(error_msg);
                }
                this._sendRecordsCompletedToPages();
                return resolve();
            });
        },

        /**
         * @param {Array} records_done
         * @param {Boolean} has_errors
         */
        // eslint-disable-next-line
        onSynchronizedRecords: function(records_done, has_errors) {
            return new Promise(async (resolve, reject) => {
                try {
                    await this.removeSyncRecords(_.map(records_done, "id"));
                } catch (err) {
                    return reject(err);
                }
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
        sendRecordsToPages: function(forced_sync = false) {
            return this.getSyncRecords().then(records => {
                this.postBroadcastMessage({
                    type: "PWA_SYNC_RECORDS",
                    records: records,
                    forced_sync: forced_sync,
                });
            });
        },

        /**
         * This will update the counter of transactions to synchronize on the
         * client pages.
         *
         * @returns {Promise}
         */
        sendCountToPages: function() {
            return this.getSyncRecords().then(records => {
                this.postBroadcastMessage({
                    type: "PWA_SYNC_RECORDS_COUNT",
                    count: records.length,
                });
            });
        },

        /**
         * Send correct sync process to the client pages
         *
         * @private
         * @param {Number} index
         */
        _sendRecordOKToPages: function(index) {
            this.postBroadcastMessage({
                type: "PWA_SYNC_RECORD_OK",
                index: index,
            });
        },

        /**
         * Send failed sync process to the client pages
         *
         * @private
         * @param {Number} index
         */
        _sendRecordFailToPages: function(index, errmsg) {
            this.postBroadcastMessage({
                type: "PWA_SYNC_RECORD_FAIL",
                index: index,
                errmsg: errmsg,
            });
        },

        /**
         * Send completed sync. tasks
         *
         * @private
         */
        _sendRecordsCompletedToPages: function() {
            this.postBroadcastMessage({
                type: "PWA_SYNC_RECORDS_COMPLETED",
            });
        },

        /**
         * Messages received from client.
         * Here we use POST instead of use the Broadcast API to ensure that
         * the service worker wakeup.
         *
         * @param {String} type
         * @returns {Promise}
         */
        onProcessMessage: function(type) {
            if (type === "GET_CONFIG") {
                return this.sendCountToPages();
            }
            if (!this.isActivated()) {
                return Promise.resolve();
            }
            if (type === "GET_SYNC_RECORDS") {
                return this.sendRecordsToPages();
            } else if (type === "START_SYNCHRONIZATION") {
                return this.getParent()
                    ._doPrefetchDataPost()
                    .catch(err => {
                        console.log(
                            "[ServiceWorker] Error: can't complete the synchronization process."
                        );
                        console.log(err);
                    });
            }

            return Promise.resolve();
        },
    });

    return SWSyncManager;
});
