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

        _updateLinkedRecords: function(records, record, new_id) {
            return new Promise(async (resolve, reject) => {
                const linked_models = Object.keys(record.linked);
                for (const model of linked_models) {
                    if (model !== record.model) {
                        continue;
                    }
                    const changes = record.linked[model];
                    for (const change of changes) {
                        // Update referenced records (stored in sqlitedb)
                        let model_record = false;
                        try {
                            model_record = await this._db.browse(model, change.id);
                        } catch (err) {
                            continue;
                        }
                        let field = model_record[change.field];
                        let has_field_changed = false;
                        if (field === change.change) {
                            field = new_id;
                            has_field_changed = true;
                        } else if (
                            field instanceof Array &&
                            field.indexOf(change.change) !== -1
                        ) {
                            field = _.map(field, item =>
                                item === change.change ? new_id : item
                            );
                            has_field_changed = true;
                        }

                        if (has_field_changed) {
                            model_record[change.field] = field;

                            try {
                                await this._db.unlink(model, [change.id]);
                                await this._db.create(model, model_record);
                            } catch (err) {
                                return reject(err);
                            }
                        }

                        // Update sync records (stored in indexeddb)
                        for (const srecord of records) {
                            const sync_model_info = await this._db.getModelInfo(
                                srecord.model
                            );

                            const sync_field_info =
                                sync_model_info.fields[change.field];
                            if (
                                !sync_field_info ||
                                sync_field_info.relation !== record.model
                            ) {
                                continue;
                            }

                            // Normal Records
                            for (const record_sync of srecord.args) {
                                let values_rec_sync = record_sync[change.field];

                                if (values_rec_sync === change.change) {
                                    values_rec_sync = new_id;
                                } else if (
                                    values_rec_sync instanceof Array &&
                                    values_rec_sync.indexOf(change.change) !== -1
                                ) {
                                    values_rec_sync = _.map(values_rec_sync, item =>
                                        item === change.change ? new_id : item
                                    );
                                }
                                record_sync[change.field] = values_rec_sync;
                            }

                            // Linked Records Info
                            const srecord_linked_models = Object.keys(srecord.linked);
                            for (const linked_model of srecord_linked_models) {
                                if (linked_model !== record.model) {
                                    continue;
                                }
                                const linked_changes = srecord.linked[linked_model];
                                for (const linked_change of linked_changes) {
                                    if (linked_change.id === change.change) {
                                        linked_change.id = new_id;
                                    }
                                }
                            }
                        }
                    }
                }

                return resolve();
            });
        },

        _updateIds: function(records, model, old_id, new_id) {
            const get_index_init = method => {
                if (method === "create") {
                    return 0;
                } else if (method === "write") {
                    return 1;
                }
                return -1;
            };

            // Update sync records
            return new Promise(async (resolve, reject) => {
                try {
                    for (const record of records) {
                        // Update ids
                        if (
                            record.model === model &&
                            (record.method === "write" || record.method === "unlink") &&
                            record.args[0].indexOf(old_id) !== -1
                        ) {
                            record.args[0] = _.map(record.args[0], id =>
                                id === old_id ? new_id : id
                            );
                        }
                        const model_info = await this._db.getModelInfo(record.model);
                        // Update values
                        const values_index = get_index_init(record.method);
                        if (values_index !== -1) {
                            const record_values = record.args[values_index];
                            for (const field_name in record_values) {
                                const field_info = model_info.fields[field_name];
                                // Only change fields with related model
                                if (
                                    field_name !== "id" &&
                                    (!field_info || field_info.relation !== model)
                                ) {
                                    continue;
                                }
                                let field_value = record_values[field_name];
                                if (field_value === old_id) {
                                    field_value = new_id;
                                } else if (
                                    field_value instanceof Array &&
                                    field_value.indexOf(old_id) !== -1
                                ) {
                                    field_value = _.map(field_value, value =>
                                        value === old_id ? new_id : value
                                    );
                                }
                                record_values[field_name] = field_value;
                            }
                            record.args[values_index] = record_values;
                        }
                        // Update linked info
                        await this._updateLinkedRecords(records, record, new_id);
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
                const s_values = _.omit(record.args[0], ["id", "display_name"]);
                if (s_values.name) {
                    s_values.name = s_values.name.replace(
                        /\s?\(?Offline Record #\d+\)?/,
                        ""
                    );
                }
                if (record.method === "create") {
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
                }
                return resolve(s_values);
            });
        },

        _postProcessRecord: function(records, record, data_ids) {
            return new Promise(async resolve => {
                // Propagate the new id to the rest of the records
                if (record.method === "create") {
                    const new_ids =
                        typeof data_ids === "number" ? [data_ids] : data_ids;
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
                    }
                }

                return resolve();
            });
        },

        /**
         * @param {Object} record
         */
        _processRecord: function(records, record) {
            return new Promise(async (resolve, reject) => {
                const values = await this._prepareRecordValues(record);
                // Send the request to Odoo
                try {
                    const [response] = await rpc.callJSonRpc(
                        record.model,
                        record.method,
                        [values],
                        record.kwargs
                    );
                    const ids = (await response.json()).result;
                    if (!_.isNumber(ids) && !(ids instanceof Array)) {
                        await this.updateSyncRecord(
                            record.id,
                            _.extend(record, {failed: true})
                        );
                        return reject(
                            `Can't process the sync. record! (${record.model}, ${record.method})`
                        );
                    }
                    this._postProcessRecord(records, record, ids);
                    await this.updateSyncRecord(
                        record.id,
                        _.extend(record, {failed: false})
                    );
                } catch (err) {
                    await this.updateSyncRecord(
                        record.id,
                        _.extend(record, {failed: true})
                    );
                    return reject("Can't synchronize the current record. Aborting!");
                }
                this._sendRecordOKToPages(record.id);
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
                let error_msg = false;
                try {
                    const sync_keys_done = [];
                    const records = await this.getSyncRecords();
                    if (records.length) {
                        this.sendRecordsToPages(true);
                    }
                    try {
                        for (const record of records) {
                            await this._processRecord(records, record);
                            sync_keys_done.push(record.id);
                        }
                    } catch (err) {
                        error_msg = err;
                    }
                    await this.removeSyncRecords(sync_keys_done);
                } catch (err) {
                    this.sendCountToPages();
                    this._sendSyncErrorToPages(err);
                    return reject(err);
                }

                this.sendCountToPages();
                if (error_msg) {
                    this._sendSyncErrorToPages(error_msg);
                    return reject(error_msg);
                }
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
