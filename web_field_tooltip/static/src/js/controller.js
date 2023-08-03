/* Copyright 2023 ACSONE SA/NV
   Copyright 2019 TODAY Serpent Consulting Services Pvt. Ltd.
   License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define("web_field_tooltip.controller", function(require) {
    "use strict";

    const FormController = require("web.FormController");
    const ListController = require("web.ListController");
    const tooltips = require("web_field_tooltip.FieldTooltip");

    const core = require("web.core");
    const session = require("web.session");
    const _t = core._t;

    ListController.include(
        Object.assign({}, tooltips.TooltipController, {
            custom_events: _.extend({}, ListController.prototype.custom_events, {
                add_tooltip: "_onAddTooltip",
                edit_tooltip: "_onEditTooltip",
            }),
        })
    );

    FormController.include(
        Object.assign({}, tooltips.TooltipController, {
            custom_events: _.extend({}, FormController.prototype.custom_events, {
                add_tooltip: "_onAddTooltip",
                edit_tooltip: "_onEditTooltip",
            }),

            renderSidebar: function($node) {
                this._super($node);
                if (this.sidebar && session.can_manage_tooltips) {
                    this.sidebar.items.other.push({
                        label: _t("Manage Tooltips"),
                        callback: this.on_manage_tooltips,
                    });
                }
            },
            on_manage_tooltips: function() {
                const self = this;
                return self.do_action({
                    type: "ir.actions.act_window",
                    name: _t("Manage Tooltips"),
                    res_model: "ir.model.fields.tooltip",
                    target: "current",
                    views: [
                        [false, "list"],
                        [false, "form"],
                    ],
                    view_mode: "list",
                    domain: [["model", "=", self.modelName]],
                    context: {tooltip_model: self.modelName},
                });
            },
        })
    );
});
