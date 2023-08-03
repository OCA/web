/* Copyright 2023 ACSONE SA/NV
   Copyright 2019 TODAY Serpent Consulting Services Pvt. Ltd.
   License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define("web_field_tooltip.renderer", function(require) {
    "use strict";

    const FormRenderer = require("web.FormRenderer");
    const ListRenderer = require("web.ListRenderer");
    const tooltips = require("web_field_tooltip.FieldTooltip");

    FormRenderer.include(
        Object.assign({}, tooltips.TooltipRenderer, {
            init: function() {
                this._super.apply(this, arguments);
                this.tooltips = undefined;
            },

            /**
             * @override
             */
            _renderTagLabel: function(node) {
                const self = this;
                const $result = this._super.apply(this, arguments);
                const fieldName =
                    node.tag === "label" ? node.attrs.for : node.attrs.name;
                if (!fieldName) {
                    return $result;
                }
                self.add_tooltip($result, node);

                return $result;
            },
        })
    );

    ListRenderer.include(
        Object.assign({}, tooltips.TooltipRenderer, {
            init: function() {
                this._super.apply(this, arguments);
                this.tooltips = undefined;
            },

            /**
             * @override
             */
            _renderHeaderCell: function(node) {
                const self = this;
                const $result = this._super.apply(this, arguments);
                const fieldName =
                    node.tag === "label" ? node.attrs.for : node.attrs.name;
                if (!fieldName) {
                    return $result;
                }
                self.add_tooltip($result, node);

                return $result;
            },
        })
    );
});
