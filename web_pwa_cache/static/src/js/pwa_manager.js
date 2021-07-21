/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */
odoo.define("web_pwa_cache.PWAManager", function(require) {
    "use strict";

    var core = require("web.core");
    var session = require("web.session");
    var config = require("web.config");
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
        _show_prefetch_modal_delay: 5000,
        _autoclose_prefetch_modal_delay: 3000,
        _show_sw_info_modal_delay: 500,

        /**
         * @override
         */
        init: function() {
            this.init_broadcast("pwa-page-messages", "pwa-sw-messages");
            this._super.apply(this, arguments);

            this._prefetchTasksInfo = {};
            this._prefetchModelHidden = true;

            this.$modalSWInfo = $(QWeb.render("web_pwa_cache.SWInfo"));
            this._swInfoModalHidden = true;
            if (
                (this.isPWAStandalone() && !navigator.serviceWorker.controller) ||
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
            this.$modalSWInfo.on("shown.bs.modal", () => {
                if (this._swInfoModalHidden) {
                    this.$modalSWInfo.modal("hide");
                }
            });
            this.$modalPrefetchProgress = $(
                QWeb.render("web_pwa_cache.PrefetchProgress")
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

            // Reload once when the new Service Worker starts activating
            this._refreshing = false;
            navigator.serviceWorker.addEventListener("controllerchange", () => {
                if (this.refreshing) {
                    return;
                }
                this.refreshing = true;
                window.location.reload();
            });
        },

        /**
         * @override
         */
        start: function() {
            return this._super.apply(this, arguments).then(() => {
                // Try update service worker mode.
                if (
                    this.isPWAStandalone() &&
                    navigator.serviceWorker.controller &&
                    navigator.serviceWorker.controller.state === "activated"
                ) {
                    this.postBroadcastMessage({type: "GET_PWA_CONFIG"});
                }
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
                core.bus.trigger("action_reload");
                if (this.isOfflineMode()) {
                    // Can do prefetch = is online
                    this.setPWAMode("online");
                }
            }
            this._checkPrefetchProgressTimer = null;
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
            if (task_info.error) {
                $progressbar
                    .text(`${$progressbar.text()} ${_t("Error!")}`)
                    .attr("class", "progress-bar bg-danger progress-bar-striped")
                    .attr("aria-valuenow", "100")
                    .css("width", "100%");
                $message.text(`${$message.text()} ${task_info.message}`);
            } else if (task_info.total < 0) {
                $progressbar
                    .text(_t("Working"))
                    .attr(
                        "class",
                        "progress-bar bg-info progress-bar-striped progress-bar-animated"
                    )
                    .attr("aria-valuenow", "100")
                    .css("width", "100%");
                $message.text(`${$message.text()} ${task_info.message}`);
            } else if (task_info.completed) {
                $progressbar
                    .text("100%")
                    .attr("class", "progress-bar bg-info")
                    .attr("aria-valuenow", "100")
                    .css("width", "100%");
                $message.text(`${$message.text()} ${task_info.message}`);
            } else {
                $progressbar
                    .text(
                        `${task_info.progress}% (${task_info.done} / ${task_info.total})`
                    )
                    .attr("class", "progress-bar bg-info")
                    .attr("aria-valuenow", `${task_info.progress}`)
                    .css("width", `${task_info.progress}%`);
                $message.text(task_info.message);
            }
        },

        /**
         * Receive service worker messages
         *
         * @param {BroadcastChannelEvent} evt
         */
        _onReceiveBroadcastMessage: function(evt) {
            const res = BroadcastMixin._onReceiveBroadcastMessage.call(this, evt);
            if (!res) {
                return;
            }
            switch (evt.data.type) {
                /* General */
                case "PWA_INIT_CONFIG":
                    if (this._swInfoOpenTimer) {
                        clearTimeout(this._swInfoOpenTimer);
                        this._swInfoOpenTimer = false;
                    }
                    this._pwaMode = evt.data.data.pwa_mode;
                    this._swInfoModalHidden = true;
                    if (navigator.serviceWorker.controller) {
                        this.$modalSWInfo.modal("hide");
                        if (evt.data.data.is_db_empty) {
                            this.$modalPrefetchProgress.modal("hide");
                        } else if (
                            this.isPWAStandalone() &&
                            !this.modeSelector.wasShown()
                        ) {
                            this.modeSelector.show();
                        }
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
                    this.postBroadcastMessage({
                        type: "SET_PWA_CONFIG",
                        standalone: this.isPWAStandalone(),
                        uid: session.uid,
                        partner_id: session.partner_id,
                        lang: session.user_context.lang,
                    });
                    break;
                case "PWA_CONFIG_CHANGED":
                    if (evt.data.changes.pwa_mode) {
                        this._pwaMode = evt.data.changes.pwa_mode;
                    }
                    break;
                case "PWA_CACHE_FAIL":
                    this.call("notification", "notify", {
                        type: "warning",
                        title: _t("PWA Cache Not Found!"),
                        message: _t("Can't found any cache to '" + evt.data.url + "'"),
                        sticky: false,
                        className: "",
                    });
                    break;
                /* Prefetching */
                case "PREFETCH_MODAL_TASK_INFO":
                    if (!this.isPWAStandalone()) {
                        break;
                    }
                    var progress =
                        (evt.data.count_done / evt.data.count_total || 0) * 100;

                    this._updatePrefetchModalData(evt.data.id, {
                        message: evt.data.message,
                        progress: Math.round(progress),
                        total: evt.data.count_total,
                        done: evt.data.count_done,
                        error: evt.data.error,
                        completed: evt.data.completed,
                    });

                    // Always show the prefetch info modal
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
                                evt.data.force_show_modal
                                    ? 0
                                    : this._show_prefetch_modal_delay
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
                    break;
                /* Sync */
                case "PWA_SYNC_RECORDS":
                    this._syncModal = new PWASyncModal(evt.data.records, {
                        sync: this._onSyncNow.bind(this),
                        forced_sync: evt.data.forced_sync,
                        pwa_mode: this._pwaMode,
                    });
                    this._syncModal.show();
                    break;
                case "PWA_SYNC_RECORD_OK":
                    if (this._syncModal && this._syncModal.isOpen()) {
                        this._syncModal.$el
                            .find("tr#record_sync_" + evt.data.index)
                            .addClass("bg-success");
                    }
                    break;
                case "PWA_SYNC_RECORDS_COMPLETED":
                    if (this._syncModal && this._syncModal.isOpen()) {
                        this._syncModal.close();
                    }
                    break;
                case "PWA_SYNC_NEED_ACTION":
                    this.call("notification", "notify", {
                        type: "info",
                        title: _t("Have transactions to synchronize"),
                        message:
                            "You have '" +
                            evt.data.count +
                            "' transactions to synchronize",
                        sticky: false,
                        className: "",
                    });
                    break;
            }
        },

        _onSyncNow: function() {
            this.postBroadcastMessage({
                type: "START_SYNCHRONIZATION",
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
    });
});
