/* Copyright 2021 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */
odoo.define("web_pwa_cache.ActionManager", function(require) {
    "use strict";

    const ActionManager = require("web.ActionManager");
    const core = require("web.core");

    // This is used to reload last action when "prefetching" is done
    // to ensure display updated records
    ActionManager.include({
        /**
         * @override
         */
        start: function() {
            core.bus.on("action_reload", this, this._onActionReload);
            return this._super.apply(this, arguments);
        },

        /**
         * @override
         */
        destroy: function() {
            core.bus.off("action_reload", this, this._onActionReload);
            return this._super.apply(this, arguments);
        },

        /**
         * @private
         */
        _onActionReload: function() {
            const action = this.getCurrentAction();
            if (action) {
                this.doAction(action.id, {clear_breadcrumbs: true});
            }
        },
    });
});
