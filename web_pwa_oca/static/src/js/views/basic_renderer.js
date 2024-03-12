/* Copyright 2022 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */
odoo.define("web_pwa_oca.BasicRenderer", function(require) {
    "use strict";

    var BasicRenderer = require("web.BasicRenderer");
    var WebClientObj = require("web.web_client");

    BasicRenderer.include({
        /**
         * @override
         */
        init: function() {
            this._super.apply(this, arguments);
            this._isPWAStandalone = WebClientObj.pwa_manager.isPWAStandalone();
        },

        // /**
        //  * @override
        //  */
        // _renderWidget: function (record, node) {
        //     if (this._isPWAOmittedNode(node)) {
        //         return $();
        //     }
        //     return this._super.apply(this, arguments);
        // },

        /**
         * @override
         */
        _renderFieldWidget: function(node) {
            if (this._isPWAOmittedNode(node)) {
                return $();
            }
            return this._super.apply(this, arguments);
        },

        /**
         * @override
         */
        _registerModifiers: function(node) {
            if (this._isPWAOmittedNode(node)) {
                return $();
            }
            return this._super.apply(this, arguments);
        },

        _hasPWACSSClass: function(node, classname) {
            if (typeof node !== "object") {
                return false;
            }
            const node_classes =
                ("attrs" in node && node.attrs.class && node.attrs.class.split(" ")) ||
                [];
            if (node_classes.indexOf(classname) !== -1) {
                return true;
            }
            for (const children of node.children) {
                if (this._hasPWACSSClass(children, classname)) {
                    return true;
                }
            }

            return false;
        },

        /**
         * Check if the tag needs to be omitted
         *
         * @param {Object} node
         * @returns {Boolean}
         */
        _isPWAOmittedNode: function(node) {
            if (
                typeof node !== "object" ||
                (this._isPWAStandalone &&
                    node.attrs &&
                    (node.attrs.invisible === "1" ||
                        (node.attrs.modifiers &&
                            node.attrs.modifiers.invisible === true)))
            ) {
                return false;
            }
            var is_valid_element = [].indexOf(node.tag) !== -1;
            var is_button_box =
                is_valid_element &&
                node.tag === "div" &&
                node.attrs.name === "button_box";
            var is_default_invisible =
                this._isPWAStandalone &&
                this.$el.hasClass("oe_pwa_standalone_invisible");
            var is_visible =
                this._hasPWACSSClass(node, "oe_pwa_standalone_visible") &&
                !(
                    node.attr &&
                    node.attr.modifiers &&
                    node.attr.modifiers.invisible === true
                );
            if (
                !is_valid_element &&
                !is_button_box &&
                "attrs" in node &&
                node.attrs.class
            ) {
                var node_classes = node.attrs.class.split(" ");
                return (
                    (is_default_invisible && !is_visible) ||
                    (this._isPWAStandalone &&
                        node_classes.indexOf("oe_pwa_standalone_omit") !== -1) ||
                    (!this._isPWAStandalone &&
                        node_classes.indexOf("oe_pwa_standalone_only") !== -1)
                );
            }

            return is_default_invisible && !is_visible;
        },
    });
});
