/* Copyright 2023 ACSONE SA/NV
   Copyright 2019 TODAY Serpent Consulting Services Pvt. Ltd.
   License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define("web_field_tooltip.FieldTooltip", function(require) {
    "use strict";

    var core = require("web.core");
    var FormRenderer = require("web.FormRenderer");
    var FormController = require("web.FormController");
    var field_utils = require("web.field_utils");
    var rpc = require("web.rpc");
    var _t = core._t;

    FormRenderer.include({
        /**
         * @override
         */
        _renderTagLabel: function(node) {
            var self = this;
            var $result = this._super.apply(this, arguments);
            var fieldName = node.tag === "label" ? node.attrs.for : node.attrs.name;

            // Check if there's any tooltip that must be rendered for the given view

            var tooltips = {};

            if (self.tooltips) {
                tooltips = self.tooltips;
            } else {
                tooltips = rpc.query({
                    model: "ir.model.fields.tooltip",
                    method: "search_read",
                    domain: [["model", "=", self.state.model]],
                });
                self.tooltips = tooltips;
            }

            tooltips.then(function(data) {
                if (data) {
                    _.each(data, function(tooltip) {
                        if (tooltip.field_name === fieldName) {
                            var $after_elem = $("<button>", {
                                class: "fa fa fa-question-circle tooltip-icon",
                                for: self._getIDForLabel(fieldName),
                                role: "button",
                            });

                            var $popup_div = $("<div/>", {
                                class: "popup-div",
                            });

                            var $popup_text = $("<p>", {
                                html: tooltip.tooltip_text
                                    ? tooltip.tooltip_text
                                    : $result.text(),
                            });

                            $popup_div.append($popup_text);

                            var $popup_last_edit = $("<p>", {
                                class: "popover-footer",
                                html:
                                    _t("Last Updated by: ") +
                                    field_utils.format.many2one(tooltip.write_uid),
                            });

                            var $edit_button = $("<button>", {
                                title: _t("Edit the tooltip"),
                                class: "fa fa-edit tooltip-icon",
                            });

                            $edit_button.on("click", function(e) {
                                e.preventDefault();
                                return self.do_action({
                                    type: "ir.actions.act_window",
                                    name: _t("Edit a Tooltip"),
                                    res_model: "ir.model.fields.tooltip",
                                    target: "current",
                                    res_id: tooltip.id,
                                    views: [[false, "form"]],
                                    view_mode: "form",
                                });
                            });

                            $popup_last_edit.append($edit_button);
                            $popup_div.append($popup_last_edit);

                            var options = {
                                content: $popup_div,
                                html: true,
                                placement: "top",
                                title: $result.text(),
                                trigger: "focus",
                                delay: {
                                    show: 0,
                                    hide: 100,
                                },
                            };
                            $after_elem.popover(options);
                            $result.append($after_elem);
                        }
                    });
                }
            });
            return $result;
        },
    });

    FormController.include({
        renderSidebar: function($node) {
            this._super($node);
            if (this.sidebar) {
                this.sidebar.items.other.push({
                    label: _t("Manage Tooltips"),
                    callback: this.on_manage_tooltips,
                });
            }
        },
        on_manage_tooltips: function() {
            var self = this;
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
    });
});
