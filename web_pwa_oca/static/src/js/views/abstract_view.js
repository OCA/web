/* Copyright 2022 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */
odoo.define("web_pwa_oca.AbstractView", function(require) {
    "use strict";

    var WebClientObj = require("web.web_client");
    var AbstractView = require("web.AbstractView");

    AbstractView.include({
        /**
         * @override
         */
        init: function() {
            this._super.apply(this, arguments);
            if (WebClientObj.pwa_manager.isPWAStandalone()) {
                this._applyStandaloneChanges(this.arch);
            }
        },

        /**
         * Apply 'standalone' changes to the node
         *
         * @param {Object} node
         */
        _applyStandaloneChanges: function(node) {
            if (typeof node !== "object") {
                return;
            }
            if ("attrs" in node && node.attrs["standalone-attrs"]) {
                var standalone_attrs = JSON.parse(node.attrs["standalone-attrs"]);
                _.extend(node.attrs, standalone_attrs);
            }
            for (var children of node.children) {
                this._applyStandaloneChanges(children);
            }
        },
    });
});
