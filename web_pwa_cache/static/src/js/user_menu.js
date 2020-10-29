odoo.define("web_pwa_cache.UserMenu", function (require) {
    "use strict";

    var UserMenu = require("web.UserMenu");
    var WebClientObj = require("web.web_client");
    var BroadcastSWMixin = require("web_pwa_cache.BroadcastSWMixin");
    require("web_pwa_cache.PWAManager");

    UserMenu.include(BroadcastSWMixin);
    UserMenu.include({
        /**
         * @override
         * @returns {Deferred}
         */
        start: function () {
            this._pwaManager = WebClientObj.pwa_manager;
            if (this._pwaManager.isPWAStandalone()) {
                this.postServiceWorkerMessage({type: 'GET_PWA_CONFIG'});
            }
            return this._super.apply(this, arguments);
        },

        _updatePWACheckbox: function (pwa_mode) {
            this.$("[data-menu='pwaMode'] input").prop('checked', pwa_mode === 'offline');
        },

        _updatePWASyncRecordsCount: function (count) {
            this.$("[data-menu='pwaQueueSync'] #records_count").text(count);
        },

        _enablePWAMenu: function () {
            this.$("[data-menu='pwaMode'],[data-menu='pwaQueueSync'],#pwaSeparator").removeClass("d-none");
        },

        /**
         * @private
         */
        _onMenuPwaMode: function () {
            const is_checked = this.$("[data-menu='pwaMode'] input").prop('checked');
            this._setPWAMode(is_checked ? 'online' : 'offline');
        },

        _onMenuPwaQueueSync: function () {
            this.postServiceWorkerMessage({type: 'GET_PWA_SYNC_RECORDS'});
        },

        _onReceiveServiceWorkerMessage: function(evt) {
            this._super.apply(this, arguments);
            switch (evt.data.type) {
                case "PWA_INIT_CONFIG": {
                    this._enablePWAMenu();
                    if (evt.data.data.pwa_mode) {
                        this._updatePWACheckbox(evt.data.data.pwa_mode);
                    }
                } break;
                case "PWA_CONFIG_CHANGED": {
                    if (evt.data.changes.pwa_mode) {
                        this._updatePWACheckbox(evt.data.changes.pwa_mode);
                    }
                } break;
                case "PWA_SYNC_RECORDS_COUNT": {
                    this._updatePWASyncRecordsCount(evt.data.count);
                }
            };
        },

        _setPWAMode: function(mode) {
            this._pwaManager.setPWAMode(mode);
        },
    });
});
