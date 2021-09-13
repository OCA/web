/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */
odoo.define("web_pwa_cache.PWAManager", function(require) {
    "use strict";

    var core = require("web.core");
    var session = require("web.session");
    var config = require("web.config");
    var Dialog = require("web.Dialog");
    var PWAManager = require("web_pwa_oca.PWAManager");
    var PWAModeSelector = require("web_pwa_cache.PWAModeSelector");
    var BroadcastMixin = require("web_pwa_cache.BroadcastMixin");
    var PWASyncModal = require("web_pwa_cache.PWASyncModal");

    var QWeb = core.qweb;
    var _t = core._t;

    /**
     * @returns {Boolean}
     */
    function isPWAStandalone() {
        return (
            window.navigator.standalone ||
            document.referrer.includes("android-app://") ||
            window.matchMedia("(display-mode: standalone)").matches
        );
    }

    if (isPWAStandalone()) {
        config.device.isMobile = true;
    }

    PWAManager.include(BroadcastMixin);
    PWAManager.include({
        custom_events: {
            change_pwa_mode: "_onChangePWAMode",
        },
        custom_broadcast_events: {
            PWA_INIT_CONFIG: "_onPWAInitConfig",
        },
        custom_broadcast_standalone_events: {
            PWA_CONFIG_CHANGED: "_onPWAConfigChanged",
            PWA_CACHE_FAIL: "_onPWACacheFail",
            PWA_PREFETCH_MODAL_TASK_INFO: "_onPWAPrefetchModalTaskInfo",
            PWA_SYNC_RECORDS: "_onPWASyncRecords",
            PWA_SYNC_RECORD_OK: "_onPWASyncRecordOK",
            PWA_SYNC_ERROR: "_onPWASyncError",
            PWA_SYNC_RECORDS_COMPLETED: "_onPWASyncRecordsComplete",
            PWA_SYNC_NEED_ACTION: "_onPWASyncNeedAction",
        },
        _show_prefetch_modal_delay: 5000,
        _autoclose_prefetch_modal_delay: 3000,
        _show_sw_info_modal_delay: 500,

        /**
         * @override
         */
        init: function() {
            this.init_broadcast("pwa-page-messages", "pwa-sw-messages");
            this._super.apply(this, arguments);

            this._wakeLockScreen = null;
            this._isWakeLockSupported = "wakeLock" in navigator;
            if (!this._isWakeLockSupported) {
                console.error(
                    _t("wakeLock API are not supported! Maybe you are not using HTTPS.")
                );
            }

            this._prefetchTasksInfo = {};
            this._prefetchModelHidden = true;
        },

        /**
         * @override
         */
        start: function() {
            this.$modalSWInfo = $(QWeb.render("web_pwa_cache.SWInfo"));
            this._swInfoModalHidden = true;
            this.$modalSWInfo.on("shown.bs.modal", () => {
                if (this._swInfoModalHidden) {
                    this.$modalSWInfo.modal("hide");
                }
            });
            this.modeSelector = new PWAModeSelector({
                online: () => {
                    this.setPWAMode("online");
                    this.postBroadcastMessage({type: "START_PREFETCH"});
                    this.modeSelector.close();
                },
                offline: () => {
                    this.setPWAMode("offline");
                    this.modeSelector.close();
                },
            });

            return this._super
                .apply(this, arguments)
                .then(() => {
                    return this._checkPWACacheStatus();
                })
                .then(() => {
                    if (!this.isPWACacheEnabled()) {
                        return;
                    }
                    // Show SW Info modal
                    if (
                        (this.isPWAStandalone() &&
                            !navigator.serviceWorker.controller) ||
                        (navigator.serviceWorker.controller &&
                            ["installing", "installed"].indexOf(
                                navigator.serviceWorker.controller.state
                            ) !== -1)
                    ) {
                        this._swInfoOpenTimer = setTimeout(
                            this._showSWInfo.bind(this),
                            this._show_sw_info_modal_delay
                        );
                    }

                    // Try update service worker mode.
                    // At this point the service worker can't be fully activated
                    // This is used to ensure a fast configuration when the service
                    // worker is activated.
                    navigator.serviceWorker.ready.then(sw => {
                        if (sw.active) {
                            this.sendConfigToSW();
                            if (this.isPWAStandalone()) {
                                this.postBroadcastMessage({type: "GET_PWA_CONFIG"});

                                // Check if service worker has the control of the pages
                                if (navigator.serviceWorker.controller) {
                                    this._swInfoModalHidden = true;
                                    this.$modalSWInfo.modal("hide");
                                } else {
                                    this.$modalSWInfo
                                        .find("#swinfo_message")
                                        .text(
                                            _t(
                                                "Service worker was activated sucessfully! Reloading the page to take the control..."
                                            )
                                        );
                                    setTimeout(location.reload(), 250);
                                }
                            }
                        }
                    });
                });
        },

        _checkPWACacheStatus: function() {
            return session
                .user_has_group("web_pwa_cache.group_pwa_cache")
                .then(result => {
                    this.is_pwa_cache_disabled = !result;
                });
        },

        /**
         * Sends the base config to the service worker
         * This is important for the worker to know if
         * is working in standalone mode.
         */
        sendConfigToSW: function() {
            this.postBroadcastMessage({
                type: "SET_PWA_CONFIG",
                standalone: this.isPWAStandalone(),
                uid: session.uid,
                partner_id: session.partner_id,
                lang: session.user_context.lang,
            });
        },

        /**
         * @returns {String}
         */
        getCacheVersion: function() {
            return this.pwa_cache_version;
        },

        _showSWInfo: function() {
            if (
                navigator.serviceWorker.controller &&
                navigator.serviceWorker.controller.state === "installed"
            ) {
                this.$modalSWInfo
                    .find("#swinfo_message")
                    .text(
                        _t(
                            "Service worker is installed but not activated, please refresh the page."
                        )
                    );
            }
            this._swInfoModalHidden = false;
            this.$modalSWInfo.modal("show");
            this._swInfoOpenTimer = false;
        },

        /**
         * @param {String} mode
         */
        setPWAMode: function(mode) {
            this._pwaMode = mode;
            this.postBroadcastMessage({
                type: "SET_PWA_CONFIG",
                pwa_mode: this._pwaMode,
            });
        },

        _autoclosePrefetchModalData: function() {
            if (this._isTasksCompleted()) {
                this._closePrefetchModalData();
                if (this.isOfflineMode()) {
                    // Can do prefetch = is online
                    this.setPWAMode("online");
                }

                if (this._wakeLockScreenPromise && this._wakeLockScreen) {
                    this.wakeLockScreen(false);
                    this._wakeLockScreenPromise = null;
                }
            }
            this._checkPrefetchProgressTimer = null;
            core.bus.trigger("action_reload");
        },

        _closePrefetchModalData: function() {
            this._prefetchModelHidden = true;
            this.$modalPrefetchProgress.modal("hide");
            this._prefetchTasksInfo = {};
        },

        _isTasksCompleted: function() {
            var completed = true;
            for (var index in this._prefetchTasksInfo) {
                if (!this._prefetchTasksInfo[index].completed) {
                    completed = false;
                    break;
                }
            }

            return completed;
        },

        _openPrefetchModalData: function() {
            if (this._prefetchModelHidden) {
                this.$modalPrefetchProgress.modal("show");
                this.$modalPrefetchProgressContent.empty();
                this._prefetchModelHidden = false;

                if (!this._wakeLockScreenPromise && !this._wakeLockScreen) {
                    this._wakeLockScreenPromise = this.wakeLockScreen(true);
                }
            }
        },

        _updatePrefetchModalData: function(id, data) {
            if (id in this._prefetchTasksInfo) {
                _.extend(this._prefetchTasksInfo[id], data);
            } else {
                this._prefetchTasksInfo[id] = data;
            }
            if (this._prefetchModelHidden) {
                return;
            }
            if (!this._prefetchTasksInfo[id]._shown) {
                this.$modalPrefetchProgressContent.append(
                    QWeb.render("web_pwa_cache.PrefetchProgressTasks", {
                        task: data,
                        task_id: id,
                    })
                );
                this._prefetchTasksInfo[id]._shown = true;
            }
            const $progressbar = this.$modalPrefetchProgressContent.find(
                `#pwa_task_${id} .progress-bar`
            );
            const $message = this.$modalPrefetchProgressContent.find(
                `#pwa_task_${id} .prefetch-message`
            );
            const task_info = this._prefetchTasksInfo[id];
            const progress_message = task_info.progress_message || "";
            if (task_info.error) {
                $progressbar
                    .text(`${$progressbar.text()} ${_t("Error!")}`)
                    .attr("class", "progress-bar bg-danger progress-bar-striped")
                    .attr("aria-valuenow", "100")
                    .css("width", "100%");
                $message.text(`${progress_message} ${task_info.message}`);
            } else if (task_info.total < 0) {
                $progressbar
                    .text(_t("Working"))
                    .attr(
                        "class",
                        "progress-bar bg-info progress-bar-striped progress-bar-animated"
                    )
                    .attr("aria-valuenow", "100")
                    .css("width", "100%");
                task_info.progress_message = task_info.message;
                $message.text(task_info.progress_message);
            } else if (task_info.completed) {
                $progressbar
                    .text("100%")
                    .attr("class", "progress-bar bg-info")
                    .attr("aria-valuenow", "100")
                    .css("width", "100%");
                $message.text(`${progress_message} ${task_info.message}`);
            } else {
                $progressbar
                    .text(
                        `${task_info.progress}% (${task_info.done} / ${task_info.total})`
                    )
                    .attr("class", "progress-bar bg-info")
                    .attr("aria-valuenow", `${task_info.progress}`)
                    .css("width", `${task_info.progress}%`);
                task_info.progress_message = task_info.message;
                $message.text(task_info.progress_message);
            }
        },

        /**
         * Receive service worker messages
         *
         * @param {BroadcastChannelEvent} evt
         */
        _onReceiveBroadcastMessage: function(evt) {
            const res = BroadcastMixin._onReceiveBroadcastMessage.call(this, evt);
            if (!res || !this.isPWACacheEnabled()) {
                return;
            }

            let method_name = null;
            if (
                Object.prototype.hasOwnProperty.call(
                    this.custom_broadcast_events,
                    evt.data.type
                )
            ) {
                method_name = this.custom_broadcast_events[evt.data.type];
            } else if (
                this.isPWAStandalone() &&
                Object.prototype.hasOwnProperty.call(
                    this.custom_broadcast_standalone_events,
                    evt.data.type
                )
            ) {
                method_name = this.custom_broadcast_standalone_events[evt.data.type];
            }
            if (method_name) {
                this[method_name].call(this, evt.data);
            }
        },

        /**
         * Event sent by the SW to share the initial configuration.
         *
         * @param {Object} evdata
         */
        _onPWAInitConfig: function(evdata) {
            if (this._swInfoOpenTimer) {
                clearTimeout(this._swInfoOpenTimer);
                this._swInfoOpenTimer = false;
            }
            this._pwaMode = evdata.data.pwa_mode;
            if (this.isPWAStandalone()) {
                if (navigator.serviceWorker.controller) {
                    // Create prefetching modal
                    this.$modalPrefetchProgress = $(
                        QWeb.render("web_pwa_cache.PrefetchProgress", {
                            sw_version: evdata.data.sw_version,
                        })
                    );
                    this.$modalPrefetchProgress.appendTo("body");
                    this.$modalPrefetchProgressContent = this.$modalPrefetchProgress.find(
                        ".modal-body"
                    );
                    this.$modalPrefetchProgress.on("shown.bs.modal", () => {
                        this._prefetchModelHidden = false;
                        // Append current data
                        for (const task_info_id in this._prefetchTasksInfo) {
                            const task_info = this._prefetchTasksInfo[task_info_id];
                            this._updatePrefetchModalData(task_info_id, task_info);
                        }
                    });
                    //
                    if (evdata.data.is_db_empty) {
                        if (this.modeSelector.isOpen()) {
                            this.modeSelector.close();
                        }
                    } else if (!this.modeSelector.wasShown()) {
                        this.modeSelector.show();
                    }
                }
            }
        },

        /**
         * Event sent by the SW to know a change in the configuration
         *
         * @param {Object} evdata
         */
        _onPWAConfigChanged: function(evdata) {
            if (evdata.changes.pwa_mode) {
                this._pwaMode = evdata.changes.pwa_mode;
            }
        },

        /**
         * Event sent by the SW to when cache missing
         *
         * @param {Object} evdata
         */
        _onPWACacheFail: function(evdata) {
            this.call("notification", "notify", {
                type: "warning",
                title: _t("PWA Cache Not Found!"),
                message: _t("Can't found any cache to '" + evdata.url + "'"),
                sticky: false,
                className: "",
            });
        },

        /**
         * Event sent by the SW to share sync. records
         *
         * @param {Object} evdata
         */
        _onPWASyncRecords: function(evdata) {
            this._syncModal = new PWASyncModal(evdata.records, {
                sync: this._onSyncNow.bind(this),
                forced_sync: evdata.forced_sync,
                pwa_mode: this._pwaMode,
            });
            this._syncModal.show();
        },

        /**
         * Event sent by the SW to know when a sync. record is complete
         *
         * @param {Object} evdata
         */
        _onPWASyncRecordOK: function(evdata) {
            if (this._syncModal && this._syncModal.isOpen()) {
                this._syncModal.$el
                    .find("tr#record_sync_" + evdata.index)
                    .addClass("bg-success");
            }
        },

        /**
         * Event sent by the SW to display sync. errors
         *
         * @param {Object} evdata
         */
        _onPWASyncError: function(evdata) {
            if (this._syncModal && this._syncModal.isOpen()) {
                this._syncModal.close();
            }
            var $content = $(
                QWeb.render("web_pwa_cache.PWASyncError", {
                    errormsg: evdata.errormsg,
                })
            );
            new Dialog(this, {
                title: _t("Synchronization error!"),
                $content: $content,
                buttons: [
                    {
                        text: _t("Close"),
                        close: true,
                    },
                ],
                fullscreen: false,
            }).open();
        },

        /**
         * Event sent by the SW to share prefetch progress
         *
         * @param {Object} evdata
         */
        _onPWAPrefetchModalTaskInfo: function(evdata) {
            const progress = (evdata.count_done / evdata.count_total || 0) * 100;

            this._updatePrefetchModalData(evdata.id, {
                message: evdata.message,
                progress: Math.round(progress),
                total: evdata.count_total,
                done: evdata.count_done,
                error: evdata.error,
                completed: evdata.completed,
            });

            // Always show the prefetch info modal
            // this is necessary because the user can
            // close the window and open again in the middle
            // of the operation
            if (this._prefetchModelHidden) {
                if (!this._prefetchModalOpenTimer) {
                    // Timer to avoid show prefetch info modal in fast tasks
                    this._prefetchModalOpenTimer = setTimeout(
                        () => {
                            // Close mode selection if we receive prefetching results
                            if (this.modeSelector.isOpen()) {
                                this.modeSelector.close();
                            }

                            this._openPrefetchModalData();
                            this._prefetchModalOpenTimer = false;
                        },
                        evdata.force_show_modal ? 0 : this._show_prefetch_modal_delay
                    );
                }
            }

            if (this._isTasksCompleted()) {
                // Avoid show prefetch info modal if all tasks are completed
                if (this._prefetchModalOpenTimer) {
                    clearTimeout(this._prefetchModalOpenTimer);
                    this._prefetchModalOpenTimer = null;
                }

                // Timeout to auto-close tasks info modal
                if (this._checkPrefetchProgressTimer) {
                    clearTimeout(this._checkPrefetchProgressTimer);
                }
                this._checkPrefetchProgressTimer = setTimeout(
                    this._autoclosePrefetchModalData.bind(this),
                    this._autoclose_prefetch_modal_delay
                );
            }
        },

        /**
         * Event sent by SW to know that all sync. process was complete successfully
         */
        _onPWASyncRecordsComplete: function() {
            if (this._syncModal && this._syncModal.isOpen()) {
                this._syncModal.close();
            }
        },

        /**
         * Sent by the SW when has sync. records to do
         *
         * @param {Object} evdata
         */
        _onPWASyncNeedAction: function(evdata) {
            this.call("notification", "notify", {
                type: "info",
                title: _t("Have transactions to synchronize"),
                message: "You have '" + evdata.count + "' transactions to synchronize",
                sticky: false,
                className: "",
            });
        },

        /**
         * Callback to start sync. process.
         *
         * @returns
         */
        _onSyncNow: function() {
            if (!this.isPWAStandalone()) {
                return;
            }
            this.postBroadcastMessage({
                type: "START_SYNCHRONIZATION",
            });
        },

        /**
         * Lock/Unlock wake
         * Generally used with 'screen' to prevent screen go off
         *
         * @param {Boolean} status
         * @returns {Promise}
         */
        wakeLockScreen: function(status) {
            if (!this._isWakeLockSupported) {
                return Promise.resolve();
            }
            return new Promise(async (resolve, reject) => {
                if (status && !this._wakeLockScreen) {
                    try {
                        this._wakeLockScreen = await navigator.wakeLock.request(
                            "screen"
                        );
                    } catch (err) {
                        return reject(err);
                    }
                } else if (!status && this._wakeLockScreen) {
                    try {
                        await this._wakeLockScreen.release();
                        this._wakeLockScreen = null;
                    } catch (err) {
                        return reject(err);
                    }
                }
                return resolve();
            });
        },

        /**
         * @returns {Boolean}
         */
        isPWAStandalone: function() {
            return isPWAStandalone();
        },

        /**
         * @returns {Boolean}
         */
        isOfflineMode: function() {
            return this._pwaMode !== "online";
        },

        /**
         * Know if the user has "no_pwa_cache" group enabled
         *
         * @returns {Boolean}
         */
        isPWACacheEnabled: function() {
            return !this.is_pwa_cache_disabled;
        },
    });
});
