odoo.define("web_pwa_cache.DataManager", function (require) {
    "use strict";

    var WebClientObj = require("web.web_client");
    var DataManager = require("web.DataManager");

    /**
     * Here we try to force use 'formPWA' instead of 'form' in standalone mode.
     * Thanks to this we don't need define the new view in the actions.
     */
    DataManager.include({
        load_views: function (params, options) {
            options.standalone = WebClientObj.pwa_manager.isPWAStandalone();
            return this._super(params, options);
        },
    });
});
