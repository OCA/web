/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_cache.PWAManager", function (require) {
    "use strict";

    var core = require("web.core");
    var session = require('web.session');
    var PWAManager = require("web_pwa_oca.PWAManager");
    var PWAModeSelector = require("web_pwa_cache.PWAModeSelector");
    var BroadcastSWMixin = require("web_pwa_cache.BroadcastSWMixin");
    var PWASyncModal = require("web_pwa_cache.PWASyncModal");

    var QWeb = core.qweb;
    var _t = core._t;

    PWAManager.include(BroadcastSWMixin);
    PWAManager.include({
        custom_events: {
            change_pwa_mode: "_onChangePWAMode",
        },
        _show_prefetch_modal_delay: 5000,
        _autoclose_prefetch_modal_delay: 3000,

        /**
         * @override
         */
        init: function () {
            this._super.apply(this, arguments);

            this._prefetchTasksInfo = {};
            this._prefetchModelHidden = true;

            this.$modalPrefetchProgress = $(
                QWeb.render("web_pwa_cache.PrefetchProgress")
            );
            this.$modalPrefetchProgress.appendTo("body");
            this.$modalPrefetchProgressContent = this.$modalPrefetchProgress.find(
                ".modal-body"
            );
            this.$modalPrefetchProgress.on("shown.bs.modal", () => {
                this._prefetchModelHidden = true;
            });

            this.modeSelector = new PWAModeSelector({
                online: () => {
                    this.setPWAMode("online");
                    this.modeSelector.close();
                },
                offline: () => {
                    this.setPWAMode("offline");
                    this.modeSelector.close();
                },
            });

            // Try update service worker mode.
            var is_standalone = this.isPWAStandalone();
            var config_values = {
                type: "SET_PWA_CONFIG",
                standalone: is_standalone,
            };
            if (!is_standalone) {
                config_values["pwa_mode"] = "online";
            }
            this.postServiceWorkerMessage(config_values);
        },

        /**
         * @param {String} mode
         */
        setPWAMode: function (mode) {
            this._pwaMode = mode;
            this.postServiceWorkerMessage({
                type: "SET_PWA_CONFIG",
                pwa_mode: this._pwaMode,
            });
        },

        _autoclosePrefetchModalData: function () {
            if (this._isTasksCompleted()) {
                this._closePrefetchModalData();
            }
            this._checkPrefetchProgressTimer = null;
        },

        _closePrefetchModalData: function () {
            this._prefetchModelHidden = true;
            this.$modalPrefetchProgress.modal("hide");
            this._prefetchTasksInfo = {};
        },

        _isTasksCompleted: function (tasks) {
            var completed = true;
            for (var index in this._prefetchTasksInfo) {
                if (!this._prefetchTasksInfo[index].completed) {
                    completed = false;
                    break;
                }
            }

            return completed;
        },

        _openPrefetchModalData: function () {
            if (!_.isEmpty(this._prefetchTasksInfo) && this._prefetchModelHidden) {
                this.$modalPrefetchProgress.modal("show");
                this._prefetchModelHidden = false;
                this._updatePrefetchModalData();
            }
        },

        _updatePrefetchModalData: function () {
            this.$modalPrefetchProgressContent.empty().append(
                QWeb.render("web_pwa_cache.PrefetchProgressTasks", {
                    tasks: _.values(this._prefetchTasksInfo),
                })
            );
        },

        /**
         * Receive service worker messages
         *
         * @param {BroadcastChannelEvent} evt
         */
        _onReceiveServiceWorkerMessage: function (evt) {
            this._super.apply(this, arguments);
            switch (evt.data.type) {
                /* General */
                case "PWA_INIT_CONFIG":
                    {
                        this._pwaMode = evt.data.data.pwa_mode;
                        if (evt.data.data.is_db_empty) {
                            this.$modalPrefetchProgress.modal("hide");
                        } else if (this.isPWAStandalone() && !this.modeSelector.wasShown()) {
                            this.modeSelector.show();
                        }
                        this.postServiceWorkerMessage({
                            type: "SET_PWA_CONFIG",
                            standalone: this.isPWAStandalone(),
                            uid: session.uid,
                            lang: session.user_context.lang,
                        });
                    }
                    break;
                case "PWA_CONFIG_CHANGED":
                    {
                        if (evt.data.changes.pwa_mode) {
                            this._pwaMode = evt.data.changes.pwa_mode;
                        }
                    }
                    break;
                case "PWA_CACHE_FAIL":
                    {
                        this.call("notification", "notify", {
                            type: "warning",
                            title: _("PWA Cache Not Found!"),
                            message: _t(
                                "Can't found any cache to '" + evt.data.url + "'"
                            ),
                            sticky: false,
                            className: "",
                        });
                    }
                    break;
                /* Prefetching */
                case "PREFETCH_MODAL_TASK_INFO":
                    {
                        var progress = (evt.data.count_done/evt.data.count_total || 0) * 100;
                        this._prefetchTasksInfo[evt.data.id] = {
                            message: evt.data.message,
                            progress: Math.round(progress),
                            total: evt.data.count_total,
                            done: evt.data.count_done,
                            error: evt.data.error,
                            completed: evt.data.completed,
                        };

                        // Close mode selection if we receive prefetching results
                        if (this.modeSelector.isOpen()) {
                            this.modeSelector.close();
                        }
                        // Always show the prefetch info modal
                        if (this._prefetchModelHidden) {
                            if (!this._prefetchModalOpenTimer) {
                                // Timer to avoid show prefetch info modal in fast tasks
                                this._prefetchModalOpenTimer = setTimeout(() => {
                                    this._openPrefetchModalData();
                                    this._prefetchModalOpenTimer = false;
                                }, evt.data.force_show_modal?0:this._show_prefetch_modal_delay);
                            }
                        } else {
                            this._updatePrefetchModalData();
                            if (evt.data.completed) {
                                // Timeout to auto-close tasks info modal
                                if (this._checkPrefetchProgressTimer) {
                                    clearTimeout(this._checkPrefetchProgressTimer);
                                }
                                this._checkPrefetchProgressTimer = setTimeout(
                                    this._autoclosePrefetchModalData.bind(this),
                                    this._autoclose_prefetch_modal_delay
                                );
                            }
                        }

                        // Avoid show prefetch info modal if all tasks are completed
                        if (this._isTasksCompleted() && this._prefetchModalOpenTimer) {
                            clearTimeout(this._prefetchModalOpenTimer);
                            this._prefetchModalOpenTimer = null;
                        }
                    }
                    break;
                /* Sync */
                case "PWA_SYNC_RECORDS":
                    {
                        this._syncModal = new PWASyncModal(evt.data.records, {
                            sync: this._onSyncNow.bind(this),
                            forced_sync: evt.data.forced_sync
                        });
                        this._syncModal.show();
                    }
                    break;
                case "PWA_SYNC_RECORD_OK":
                    {
                        if (this._syncModal && this._syncModal.isOpen()) {
                            this._syncModal.$el.find("tr#record_sync_" + evt.data.index).addClass("bg-success");
                        }
                    }
                    break;
                case "PWA_SYNC_RECORDS_COMPLETED":
                    {
                        if (this._syncModal && this._syncModal.isOpen()) {
                            this._syncModal.close();
                        }
                    }
                    break;
                case "PWA_SYNC_NEED_ACTION":
                    {
                        this.call("notification", "notify", {
                            type: "info",
                            title: _("Have transactions to synchronize"),
                            message:
                                "You have '" +
                                evt.data.count +
                                "' transactions to synchronize",
                            sticky: false,
                            className: "",
                        });

                        evt.data.records;
                    }
                    break;
            }
        },

        _onSyncNow: function () {
            this.postServiceWorkerMessage({
                type: "START_SYNCHRONIZATION",
            });
        },

        /**
         * @returns {Boolean}
         */
        isPWAStandalone: function () {
            return (
                window.navigator.standalone ||
                document.referrer.includes("android-app://") ||
                window.matchMedia("(display-mode: standalone)").matches
            );
        },
    });
});
