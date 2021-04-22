/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_cache.ListController", function(require) {
    "use strict";

    const ListController = require("web.ListController");

    ListController.include({
        events: _.extend({}, ListController.prototype.events, {
            "click .o_button_pwa_update_caches": "_onClickPWAUpdateCaches",
        }),

        /**
         * @private
         */
        _onClickPWAUpdateCaches: function() {
            return this._rpc({
                model: "pwa.cache",
                method: "update_caches",
                args: [false],
            });
        },
    });
});
