/* Copyright 2022 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */
odoo.define("web_pwa_oca.DataManager", function(require) {
    "use strict";

    var WebClientObj = require("web.web_client");
    var DataManager = require("web.DataManager");

    /**
     * Communicate to the server if the client is in standalone mode or not
     */
    DataManager.include({
        /**
         * @override
         */
        load_views: function(params, options) {
            options = options || {};
            options.standalone = WebClientObj.pwa_manager.isPWAStandalone();
            return this._super(params, options);
        },
    });
});
