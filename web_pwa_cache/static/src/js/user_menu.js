/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */
odoo.define("web_pwa_cache.UserMenu", function(require) {
    "use strict";

    const core = require("web.core");
    const UserMenu = require("web.UserMenu");
    const WebClientObj = require("web.web_client");
    const BroadcastMixin = require("web_pwa_cache.BroadcastMixin");
    require("web_pwa_cache.PWAManager");

    const _t = core._t;

    UserMenu.include(BroadcastMixin);
    UserMenu.include({
        /**
         * @override
         */
        init: function() {
            this.init_broadcast("pwa-page-messages", "pwa-sw-messages");
            this._super.apply(this, arguments);
        },

        /**
         * @override
         */
        start: function() {
            return this._super.apply(this, arguments).then(() => {
                this._pwaManager = WebClientObj.pwa_manager;
                if (this._pwaManager.isPWAStandalone()) {
                    this._enablePWAMenu();
                    this._updatePWAMenuInfo(
                        this._pwaManager.isOfflineMode() ? "offline" : "online"
                    );
                }
            });
        },

        _updatePWAMenuInfo: function(pwa_mode) {
            const is_offline = pwa_mode === "offline";
            this.$("#pwa_status").text(is_offline ? _t("Offline") : _t("Online"));
            this.$("[data-menu='pwaMode']")
                .text(
                    is_offline
                        ? _t("Switch to online mode")
                        : _t("Switch to offline mode")
                )
                .data("pwaMode", pwa_mode);
        },

        _updatePWASyncRecordsCount: function(count) {
            this.$("[data-menu='pwaQueueSync'] #pwa_sync_records_count").text(count);
        },

        _enablePWAMenu: function() {
            this.$(
                "[data-menu='pwaMode'],[data-menu='pwaQueueSync'],#pwaSeparator"
            ).removeClass("d-none");
        },

        /**
         * @private
         */
        _onMenuPwaMode: function() {
            let pwa_mode = this.$("[data-menu='pwaMode']").data("pwaMode");
            pwa_mode = pwa_mode === "offline" ? "online" : "offline";
            this._setPWAMode(pwa_mode);
            this._updatePWAMenuInfo(pwa_mode);
            if (pwa_mode === "online") {
                this.postBroadcastMessage({type: "START_PREFETCH"});
            }
        },

        _onMenuPwaQueueSync: function() {
            this.postBroadcastMessage({type: "GET_PWA_SYNC_RECORDS"});
        },

        _onReceiveBroadcastMessage: function(evt) {
            const res = BroadcastMixin._onReceiveBroadcastMessage.call(this, evt);
            if (!res) {
                return false;
            }
            switch (evt.data.type) {
                case "PWA_INIT_CONFIG":
                    this._enablePWAMenu();
                    if (evt.data.data.pwa_mode) {
                        this._updatePWAMenuInfo(evt.data.data.pwa_mode);
                    }
                    break;
                case "PWA_CONFIG_CHANGED":
                    if (evt.data.changes.pwa_mode) {
                        this._updatePWAMenuInfo(evt.data.changes.pwa_mode);
                    }
                    break;
                case "PWA_SYNC_RECORDS_COUNT": {
                    this._updatePWASyncRecordsCount(evt.data.count);
                }
            }
        },

        _setPWAMode: function(mode) {
            this._pwaManager.setPWAMode(mode);
        },
    });
});
