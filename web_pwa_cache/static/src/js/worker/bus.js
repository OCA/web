"use strict";
/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

/**
 * This class is used to communicate with the user page.
 */
PWA.include({
    /**
     * @override
     */
    init: function () {
        this._super.apply(this, arguments);
        this._channel_out = new BroadcastChannel("sw-messages");
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
        return; // FIXME: Bypass client messages
        if (!evt.isTrusted) {
            return;
        }
        this._whenLoaded().then(() => {
            switch (evt.data.type) {
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
                                const count = await this._db.countRecords("webclient", "userdata");
                                this.postClientPageMessage({
                                    type: "PWA_CONFIG_CHANGED",
                                    changes: changes,
                                });
                                const event_online = typeof evt.data.pwa_mode !== 'undefined' && evt.data.pwa_mode === "online";
                                const config_offline = await this.config.isOfflineMode();
                                const config_standalone = await this.config.isStandaloneMode();
                                const is_online = event_online || (typeof evt.data.pwa_mode === 'undefined' && !config_offline);
                                const is_standalone = (typeof evt.data.standalone !== 'undefined' && evt.data.standalone) || (typeof evt.data.standalone === 'undefined' && config_standalone);
                                if ((is_online && is_standalone && !count) || (event_online && is_standalone)) {
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
                case "GET_PWA_CONFIG":
                    {
                        this.config.sendToClient();
                    }
                    break;
                case "GET_PWA_SYNC_RECORDS":
                    {
                        this._components.sync.sendRecordsToClient();
                    }
                    break;
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
                case "START_PREFETCH":
                    {
                        this._doPrefetchDataPost();
                    }
                    break;
            }
        });
    },

    _doPrefetchDataPost: function () {
        if (this._prefetch_promise) {
            return this._prefetch_promise;
        }

        this._prefetch_promise = new Promise(async (resolve, reject) => {
            this._prefetch_run = true;
            const is_offline_mode = await this.config.isOfflineMode();
            if (is_offline_mode) {
                return resolve();
            }

            try {
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
