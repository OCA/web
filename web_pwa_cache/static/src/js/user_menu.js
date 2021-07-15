odoo.define("web_pwa_cache.UserMenu", function(require) {
    "use strict";

    var UserMenu = require("web.UserMenu");
    var WebClientObj = require("web.web_client");
    var BroadcastMixin = require("web_pwa_cache.BroadcastMixin");
    require("web_pwa_cache.PWAManager");

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
                }
            });
        },

        _updatePWACheckbox: function(pwa_mode) {
            this.$("[data-menu='pwaMode'] input").prop(
                "checked",
                pwa_mode === "offline"
            );
        },

        _updatePWASyncRecordsCount: function(count) {
            this.$("[data-menu='pwaQueueSync'] #records_count").text(count);
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
            const is_checked = this.$("[data-menu='pwaMode'] input").prop("checked");
            this._setPWAMode(is_checked ? "online" : "offline");
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
                        this._updatePWACheckbox(evt.data.data.pwa_mode);
                    }
                    break;
                case "PWA_CONFIG_CHANGED":
                    if (evt.data.changes.pwa_mode) {
                        this._updatePWACheckbox(evt.data.changes.pwa_mode);
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
