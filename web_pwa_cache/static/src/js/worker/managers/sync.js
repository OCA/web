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
        init: function(parent) {
            this.init_broadcast("pwa-sw-messages", "pwa-page-messages");
            this._super.apply(this, arguments);
            this._db = this.options.db || parent._db;
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

        _updateIds: function(records, model, old_id, new_id) {
            // Update sync records
            return new Promise(async (resolve, reject) => {
                try {
                    const tasks = [];
                    for (const record of records) {
                        // Update ids
                        if (
                            record.model === model &&
                            (record.method === "write" || record.method === "unlink")
                        ) {
                            record.args[0] = _.map(record.args[0], id =>
                                id === old_id ? new_id : id
                            );
                        }
                        // Update values
                        let values_index = -1;
                        if (record.method === "create") {
                            values_index = 0;
                        } else if (record.method === "write") {
                            values_index = 1;
                        }
                        if (values_index !== -1) {
                            const model_info = await this._db.getModelInfo(
                                record.model
                            );
                            const record_values = record.args[values_index];
                            for (const field_name in record_values) {
                                const field_info = model_info.fields[field_name];
                                // Only change fields with related model
                                if (!field_info || field_info.relation !== model) {
                                    continue;
                                }
                                let field_value = record_values[field_name];
                                if (field_value === old_id) {
                                    field_value = new_id;
                                } else if (field_value instanceof Array) {
                                    field_value = _.map(field_value, value =>
                                        value === old_id ? new_id : value
                                    );
                                }
                                record_values[field_name] = field_value;
                            }
                            record.args[values_index] = record_values;
                        }
                        // Update linked info
                        for (const model in record.linked) {
                            const changes = record.linked[model];
                            for (const index in changes) {
                                const change = changes[index];
                                if (change.id === old_id) {
                                    change.id = new_id;
                                }
                                if (change.change === old_id) {
                                    change.change = new_id;
                                }

                                record.linked[model][index] = change;
                            }
                        }
                        tasks.push(this.updateSyncRecord(record.id, record));
                    }
                    await Promise.all(tasks);
                } catch (err) {
                    return reject(err);
                }
                return resolve();
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
                try {
                    const sync_keys_done = [];
                    const records = await this.getSyncRecords();
                    if (records.length) {
                        this.sendRecordsToPages(true);
                    }
                    for (const record of records) {
                        let s_args = record.args;
                        // Remove generated client ids to be generated by server side
                        if (record.method === "create") {
                            const [response_s] = await rpc.callJSonRpc(
                                record.model,
                                "default_get",
                                s_args,
                                record.kwargs
                            );
                            const defaults = (await response_s.json()).result;
                            s_args = _.map(record.args, item => {
                                const values = _.omit(item, ["id", "display_name"]);
                                if (values.name) {
                                    values.name = values.name.replace(
                                        /\s?\(?Offline Record #\d+\)?/,
                                        ""
                                    );
                                }
                                for (const key in values) {
                                    if (!values[key] && key in defaults) {
                                        values[key] = defaults[key];
                                    }
                                }
                                return values;
                            });
                        }
                        let response = false;
                        try {
                            [response] = await rpc.callJSonRpc(
                                record.model,
                                record.method,
                                s_args,
                                record.kwargs
                            );
                        } catch (err) {
                            console.log(
                                "[ServiceWorker] Error: can't synchronize the current record. Aborting!"
                            );
                            await this.updateSyncRecord(record.id, {failed: true});
                            break;
                        }
                        // Propagate the new id to the rest of the records
                        if (record.method === "create") {
                            const response_clone = response.clone();
                            const data = await response_clone.json();
                            const new_ids =
                                typeof data.result === "number"
                                    ? [data.result]
                                    : data.result;
                            for (const index_b in new_ids) {
                                const new_id = new_ids[index_b];
                                const old_id = record.args[index_b].id;
                                // UpdateIds can not found the key... so is normal get fails here
                                try {
                                    await this._updateIds(
                                        records,
                                        record.model,
                                        old_id,
                                        new_id
                                    );
                                } catch (err) {
                                    // Do nothing
                                }
                                // Update linked records
                                const linked_models = Object.keys(record.linked);
                                for (const model of linked_models) {
                                    const changes = record.linked[model];
                                    for (const change of changes) {
                                        // Update normal records
                                        let model_record = false;
                                        try {
                                            model_record = await this._db.browse(
                                                model,
                                                change.id
                                            );
                                        } catch (err) {
                                            continue;
                                        }
                                        let field = model_record[change.field];
                                        if (typeof field === "object") {
                                            field = _.map(field, item => {
                                                if (item === change.change) {
                                                    return new_id;
                                                }
                                                return item;
                                            });
                                        } else {
                                            field = new_id;
                                        }
                                        model_record[change.field] = field;
                                        await this._db.unlink(model, [change.id]);
                                        await this._db.create(model, model_record);

                                        // Update sync records
                                        for (const srecord of records) {
                                            if (srecord.model !== model) {
                                                continue;
                                            }
                                            // If (srecord.id)
                                            for (const record_sync of srecord.args) {
                                                let values_rec_sync =
                                                    record_sync[change.field];
                                                if (
                                                    typeof values_rec_sync === "object"
                                                ) {
                                                    values_rec_sync = _.map(
                                                        values_rec_sync,
                                                        item => {
                                                            if (
                                                                item === change.change
                                                            ) {
                                                                return new_id;
                                                            }
                                                            return item;
                                                        }
                                                    );
                                                } else {
                                                    values_rec_sync = new_id;
                                                }
                                                record_sync[
                                                    change.field
                                                ] = values_rec_sync;
                                            }
                                        }
                                    }
                                }

                                // Maybe the id has be changed by a linked record... no problem.
                                try {
                                    const old_record = await this._db.browse(
                                        record.model,
                                        old_id
                                    );
                                    old_record.id = new_id;
                                    await this._db.unlink(record.model, [old_id]);
                                    await this._db.create(record.model, old_record);
                                } catch (err) {
                                    // Do nothing
                                }
                            }
                        }
                        sync_keys_done.push(record.id);
                        this._sendRecordOKToPages(record.id);
                    }

                    await this.removeSyncRecords(sync_keys_done);
                } catch (err) {
                    this._sendSyncErrorToPages(err);
                    this.sendCountToPages();
                    return reject(err);
                }

                this.sendCountToPages();
                this._sendRecordsCompletedToPages();
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
         * @param {String} errormsg
         */
        _sendSyncErrorToPages: function(errormsg) {
            this.postBroadcastMessage({
                type: "PWA_SYNC_ERROR",
                errormsg: errormsg,
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

        _onReceiveBroadcastMessage: function(evt) {
            const res = BroadcastMixin._onReceiveBroadcastMessage.call(this, evt);
            if (!res || !this.isActivated()) {
                return;
            }
            switch (evt.data.type) {
                case "GET_PWA_CONFIG":
                    this.sendCountToPages();
                    break;
                // Received to send pwa sync. records to the user page.
                case "GET_PWA_SYNC_RECORDS":
                    this.sendRecordsToPages();
                    break;

                // Received to start the sync. process
                case "START_SYNCHRONIZATION":
                    this.getParent()
                        ._doPrefetchDataPost()
                        .catch(err => {
                            console.log(
                                "[ServiceWorker] Error: can't complete the synchronization process."
                            );
                            console.log(err);
                        });
                    break;
            }
        },
    });

    return SWSyncManager;
});
