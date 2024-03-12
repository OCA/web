/* Copyright 2022 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */
odoo.define("web_pwa_oca.BasicView", function(require) {
    "use strict";

    var WebClientObj = require("web.web_client");
    var BasicView = require("web.BasicView");

    BasicView.include({
        /**
         * This is necessary to ensure kanban mode
         *
         * @override
         */
        _processField: function(viewType, field, attrs) {
            if (WebClientObj.pwa_manager.isPWAStandalone() && attrs.mode) {
                var modes = attrs.mode.split(",");
                if (modes[0] === "tree" && modes.indexOf("kanban") !== -1) {
                    attrs.mode = "kanban";
                }
            }
            return this._super.apply(this, arguments);
        },

        /**
         * This is necessary to avoid do rpc calls
         *
         * @override
         */
        _processNode: function(node, fv) {
            if (this._isPWAOmittedNode(node, fv)) {
                return false;
            }
            return this._super.apply(this, arguments);
        },

        /**
         * @param {Object} node
         * @returns {Boolean}
         */
        _isPWAOmittedNode: function(node, fv) {
            if (typeof node === "object" && node.tag === "field") {
                var is_pwa_standalone = WebClientObj.pwa_manager.isPWAStandalone();
                if (
                    is_pwa_standalone &&
                    node.attrs &&
                    (node.attrs.invisible === "1" ||
                        (node.attrs.modifiers && node.attrs.modifiers.invisible))
                ) {
                    return false;
                }
                var container_classes =
                    ("class" in fv.arch.attrs && fv.arch.attrs.class.split(" ")) || [];
                var is_default_invisible =
                    container_classes &&
                    is_pwa_standalone &&
                    container_classes.indexOf("oe_pwa_standalone_invisible") !== -1;
                if ("attrs" in node && node.attrs.class) {
                    var node_classes = node.attrs.class.split(" ");
                    return (
                        (is_default_invisible &&
                            node_classes.indexOf("oe_pwa_standalone_visible") === -1) ||
                        (is_pwa_standalone &&
                            node_classes.indexOf("oe_pwa_standalone_omit") !== -1) ||
                        (!is_pwa_standalone &&
                            node_classes.indexOf("oe_pwa_standalone_only") !== -1)
                    );
                }
                return is_default_invisible;
            }

            return false;
        },
    });
});
