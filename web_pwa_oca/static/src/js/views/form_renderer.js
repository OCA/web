/* Copyright 2022 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */
odoo.define("web_pwa_oca.FormRenderer", function(require) {
    "use strict";

    require("web_pwa_oca.BasicRenderer");
    var FormRenderer = require("web.FormRenderer");
    require("mail.form_renderer");

    FormRenderer.include({
        /**
         * @override
         */
        _renderNode: function(node) {
            if (
                this._isPWAOmittedNode(node) ||
                (this._isPWAStandalone &&
                    node.tag === "div" &&
                    node.attrs.class === "oe_chatter" &&
                    this.$el.hasClass("oe_pwa_standalone_no_chatter"))
            ) {
                return $();
            }
            return this._super.apply(this, arguments);
        },

        /**
         * @override
         */
        _renderGenericTag: function(node) {
            if (this._isPWAOmittedNode(node)) {
                return $();
            }
            return this._super.apply(this, arguments);
        },

        /**
         * @override
         */
        _renderButtonBox: function(node) {
            if (this._isPWAOmittedNode(node)) {
                return $();
            }
            return this._super.apply(this, arguments);
        },

        /**
         * @override
         */
        _renderStatButton: function(node) {
            if (this._isPWAOmittedNode(node)) {
                return $();
            }
            return this._super.apply(this, arguments);
        },

        /**
         * @override
         */
        _renderTagWidget: function(node) {
            if (this._isPWAOmittedNode(node)) {
                return $();
            }
            return this._super.apply(this, arguments);
        },

        /**
         * @override
         */
        _renderTagButton: function(node) {
            if (this._isPWAOmittedNode(node)) {
                return $();
            }
            return this._super.apply(this, arguments);
        },

        /**
         * @override
         */
        _renderTagHeader: function(node) {
            if (this._isPWAOmittedNode(node)) {
                return $();
            }
            return this._super.apply(this, arguments);
        },

        /**
         * @override
         */
        _renderTagField: function(node) {
            if (this._isPWAOmittedNode(node)) {
                return $();
            }
            return this._super.apply(this, arguments);
        },

        /**
         * @override
         */
        _renderTagNotebook: function(node) {
            if (this._isPWAOmittedNode(node)) {
                return $();
            }
            return this._super.apply(this, arguments);
        },

        /**
         * @override
         */
        _renderTagSeparator: function(node) {
            if (this._isPWAOmittedNode(node)) {
                return $();
            }
            return this._super.apply(this, arguments);
        },

        /**
         * @override
         */
        _renderInnerGroupField: function(node) {
            if (this._isPWAOmittedNode(node)) {
                return $();
            }
            return this._super.apply(this, arguments);
        },

        /**
         * @override
         */
        _renderInnerGroupLabel: function(node) {
            if (this._isPWAOmittedNode(node)) {
                return $();
            }
            return this._super.apply(this, arguments);
        },

        /**
         * @override
         */
        _renderInnerGroup: function(node) {
            if (this._isPWAOmittedNode(node)) {
                return $();
            }
            return this._super.apply(this, arguments);
        },

        /**
         * @override
         */
        _renderOuterGroup: function(node) {
            if (this._isPWAOmittedNode(node)) {
                return $();
            }
            return this._super.apply(this, arguments);
        },

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
        _renderTagLabel: function(node) {
            if (
                this._isPWAOmittedNode(node) ||
                (this._isPWAStandalone &&
                    node.attrs &&
                    node.attrs.modifiers &&
                    node.attrs.modifiers.invisible === true)
            ) {
                return $();
            }
            return this._super.apply(this, arguments);
        },

        /**
         * @override
         */
        _renderTagSheet: function() {
            var $sheet = this._super.apply(this, arguments);
            if (
                this._isPWAStandalone &&
                this.$el.hasClass("oe_pwa_standalone_no_sheet")
            ) {
                $sheet.attr("class", "");
                this.has_sheet = false;
            }
            return $sheet;
        },

        /**
         * @override
         */
        _renderTagForm: function() {
            var $form = this._super.apply(this, arguments);
            if (this._isPWAStandalone) {
                $form.addClass("oe_pwa_standalone");
            }
            return $form;
        },

        /**
         * @override
         */
        _renderTabHeader: function(node) {
            if (this._isPWAOmittedNode(node)) {
                return $();
            }
            return this._super.apply(this, arguments);
        },

        /**
         * @override
         */
        _renderTabPage: function(node) {
            if (this._isPWAOmittedNode(node)) {
                return $();
            }
            return this._super.apply(this, arguments);
        },

        /**
         * @override
         */
        _renderHeaderButton: function(node) {
            if (this._isPWAOmittedNode(node)) {
                return $();
            }
            return this._super.apply(this, arguments);
        },

        /**
         * @override
         */
        _renderHeaderButtons: function(node) {
            if (this._isPWAOmittedNode(node)) {
                return $();
            }
            return this._super.apply(this, arguments);
        },
    });
});
