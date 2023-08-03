/* Copyright 2023 ACSONE SA/NV
   Copyright 2019 TODAY Serpent Consulting Services Pvt. Ltd.
   License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define("web_field_tooltip.FieldTooltip", function(require) {
    "use strict";

    const core = require("web.core");
    const dialogs = require("web.view_dialogs");
    const field_utils = require("web.field_utils");
    const rpc = require("web.rpc");
    const session = require("web.session");
    const _t = core._t;

    const TooltipRenderer = {
        add_tooltip: function($result, node) {
            const self = this;
            const tooltip_title = $result.text();

            const fieldName = node.tag === "label" ? node.attrs.for : node.attrs.name;
            if (!fieldName) {
                return $result;
            }

            // Check if there's any tooltip that must be rendered for the given view
            if (!self.tooltips) {
                self.load_tooltips();
            }

            self.$tooltip_promise.then(function() {
                let $tooltip = null;
                let allow_add_tooltip_helper =
                    session.tooltip_show_add_helper && session.can_manage_tooltips;
                _.each(self.tooltips, function(tooltip) {
                    if (tooltip.field_name === fieldName) {
                        $tooltip = self.get_tooltip_elem(
                            fieldName,
                            tooltip_title,
                            tooltip
                        );
                        $result.append($tooltip);
                        allow_add_tooltip_helper = false;
                    }
                });
                if (allow_add_tooltip_helper) {
                    $result.append(self.get_add_tooltip_elem(fieldName));
                }
            });
        },

        load_tooltips: function() {
            const self = this;
            self.$tooltip_promise = rpc
                .query({
                    model: "ir.model.fields.tooltip",
                    method: "search_read",
                    domain: [["model", "=", self.state.model]],
                })
                .then(function(result) {
                    self.tooltips = result;
                });
        },

        get_add_tooltip_elem: function(fieldName) {
            const self = this;
            const $after_elem = $("<a>", {
                class: "fa fa fa-question-circle tooltip-icon text-info",
            });

            $after_elem.on("click", function(e) {
                e.preventDefault();
                e.stopPropagation();
                self.trigger_up("add_tooltip", {
                    context: {
                        default_model: self.state.model,
                        default_field_name: fieldName,
                    },
                });
            });
            const $sup = $("<sup/>", {
                class: "field-tooltip",
            });
            $sup.append($after_elem);
            return $sup;
        },

        get_tooltip_elem: function(fieldName, tooltip_title, tooltip) {
            const self = this;
            const $after_elem = $("<a>", {
                class: "fa fa fa-question-circle tooltip-icon",
                tabIndex: 0,
            });

            const $popup_div = $("<div/>", {
                class: "popup-div",
            });

            const $popup_text = $("<p>", {
                html: tooltip.tooltip_text,
            });

            $popup_div.append($popup_text);

            if (session.can_manage_tooltips) {
                const $popup_last_edit = $("<p>", {
                    class: "popover-footer",
                    html:
                        _t("Last Updated by: ") +
                        field_utils.format.many2one(tooltip.write_uid),
                });

                const $edit_button = $("<button>", {
                    title: _t("Edit the tooltip"),
                    class: "fa fa-edit tooltip-icon",
                });

                $edit_button.on("click", function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    self.trigger_up("edit_tooltip", {
                        res_id: tooltip.id,
                    });
                });

                $popup_last_edit.append($edit_button);
                $popup_div.append($popup_last_edit);
            }

            const options = {
                content: $popup_div,
                html: true,
                placement: "top",
                title: tooltip_title,
                trigger: "focus",
                delay: {
                    show: 0,
                    hide: 0,
                },
            };
            $after_elem.popover(options);
            $after_elem.on("click", function(e) {
                e.preventDefault();
                e.stopPropagation();
                $after_elem.popover("show");
            });
            const $sup = $("<sup/>", {
                class: "field-tooltip",
            });
            $sup.append($after_elem);
            return $sup;
        },
    };

    const TooltipController = {
        _onAddTooltip: function(params) {
            const self = this;
            new dialogs.FormViewDialog(self, {
                res_model: "ir.model.fields.tooltip",
                context: _.extend(session.user_context, params.data.context),
                title: _t("Add a tooltip"),
                disable_multiple_selection: true,
            }).open();
        },
        _onEditTooltip: function(params) {
            const self = this;
            const tooltipId = params.data.res_id;
            new dialogs.FormViewDialog(self, {
                res_model: "ir.model.fields.tooltip",
                res_id: tooltipId,
                context: session.user_context,
                title: _t("Edit a tooltip"),
                disable_multiple_selection: false,
                deletable: true,
                on_remove: function() {
                    rpc.query({
                        model: "ir.model.fields.tooltip",
                        method: "unlink",
                        args: [tooltipId],
                    });
                },
            }).open();
        },
    };

    return {
        TooltipRenderer: TooltipRenderer,
        TooltipController: TooltipController,
    };
});
