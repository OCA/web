/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_cache.PWA.bus", function (require) {
    "use strict";

    const PWA = require("web_pwa_oca.PWA");
    require("web_pwa_cache.PWA");

    /**
     * This class is used to communicate with the user page.
     */
    PWA.include({
        /**
         * @override
         */
        init: function () {
            this._super.apply(this, arguments);
            // Messages to the user page
            this._channel_out = new BroadcastChannel("sw-messages");
            // Messages from the user page
            this._channel_in = new BroadcastChannel("cl-messages");
            this._channel_in.addEventListener(
                "message",
                this._onReceiveClientMessage.bind(this)
            );
        },

        /**
         * @param {Object} message
         */
        postClientPageMessage: function (message) {
            this._channel_out.postMessage(message);
        },

        /**
         * @private
         * @param {BroadcastChannelEvent} evt
         */
        _onReceiveClientMessage: function (evt) {
            if (!evt.isTrusted) {
                return;
            }
            this._whenLoaded().then(() => {
                switch (evt.data.type) {

                    // This message is received when the user page was loaded or the user changes the pwa mode.
                    // The process can be:
                    // - User has no 'userdata'. This means that the prefeteching process hasn't been done
                    //   so we run it the first time.
                    // - User change the pwa mode to 'online'. This means that we can try to prefetch data.
                    case "SET_PWA_CONFIG":
                        {
                            const promises = [];
                            const changes = {};
                            let keys = Object.keys(evt.data);
                            keys = _.filter(keys, (item) => item !== "type");
                            for (const key of keys) {
                                changes[key] = evt.data[key];
                                promises.push(this.config.set(key, changes[key]));
                            }
                            Promise.all(promises).then(() => {
                                new Promise(async (resolve) => {
                                    const model_info_userdata = await this._dbmanager.sqlitedb.getModelInfo("userdata", true);
                                    const userdata_count = await this._dbmanager.count(model_info_userdata);
                                    this.postClientPageMessage({
                                        type: "PWA_CONFIG_CHANGED",
                                        changes: changes,
                                    });
                                    const event_online = typeof evt.data.pwa_mode !== 'undefined' && evt.data.pwa_mode === "online"
                                    const config_offline = this.config.isOfflineMode();
                                    const config_standalone = this.config.isStandaloneMode();
                                    const is_online = event_online || (typeof evt.data.pwa_mode === 'undefined' && !config_offline);
                                    const is_standalone = (typeof evt.data.standalone !== 'undefined' && evt.data.standalone) || (typeof evt.data.standalone === 'undefined' && config_standalone);
                                    if ((is_online && is_standalone && !userdata_count) || (event_online && is_standalone)) {
                                        this._doPrefetchDataPost();
                                    }
                                    return resolve();
                                });
                            }).catch((err) => {
                                console.log(`[ServiceWorker] Init configuration was failed. The worker its in inconsisten state!`);
                                console.log(err);
                            });
                        }
                        break;

                    // Received to send pwa config. to the user page.
                    case "GET_PWA_CONFIG":
                        {
                            this.config.sendToClient().catch(() => {
                                console.log(`[ServiceWorker] Error sending pwa configuration to the user page!`);
                            });
                        }
                        break;

                    // Received to send pwa sync. records to the user page.
                    case "GET_PWA_SYNC_RECORDS":
                        {
                            this._components.sync.sendRecordsToClient();
                        }
                        break;

                    // Received to start the sync. process
                    case "START_SYNCHRONIZATION":
                        {
                            this._components.sync.run().then(() => this._doPrefetchDataPost(), (err) => {
                                console.log(
                                    "[ServiceWorker] Error: can't complete the synchronization process."
                                );
                                console.log(err);
                            });
                        }
                        break;

                    // Received to start the prefetching process
                    case "START_PREFETCH":
                        {
                            this._doPrefetchDataPost();
                        }
                        break;
                }
            });
        },

        /**
         * Initialize the prefetching process.
         * Try to sync. records first.
         *
         * @return {Promise}
         */
        _doPrefetchDataPost: function () {
            if (this._prefetch_promise) {
                return this._prefetch_promise;
            }

            this._prefetch_promise = new Promise(async (resolve, reject) => {
                this._prefetch_run = true;
                try {
                    const is_offline_mode = this.config.isOfflineMode();
                    if (is_offline_mode) {
                        return resolve();
                    }
                    // Try sync records first
                    await this._components.sync.run();
                    // Try prefetch data
                    await this._components.prefetch.prefetchDataPost().then(() => {
                        // If have transactions to sync. tell it to the user
                        this._components.sync.getSyncRecords().then((records) => {
                            if (records.length) {
                                this.postClientPageMessage({
                                    type: "PWA_SYNC_NEED_ACTION",
                                    count: records.length,
                                });
                            }
                        });
                    });
                } catch (err) {
                    console.log("[ServiceWorker] Prefetch Data Post failed...");
                    console.log(err);
                    return reject(err)
                }

                return resolve();
            }).finally(() => {
                this._prefetch_promise = undefined;
                this._prefetch_run = false;
            });
        },
    });

});
