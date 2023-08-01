/* Copyright 2023 ACSONE SA/NV
   Copyright 2019 TODAY Serpent Consulting Services Pvt. Ltd.
   License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define("web_field_tooltip.FieldTooltip", function(require) {
    "use strict";

    const FormRenderer = require("web.FormRenderer");
    const ListRenderer = require("web.ListRenderer");
    const FormController = require("web.FormController");

    const core = require("web.core");
    const field_utils = require("web.field_utils");
    const rpc = require("web.rpc");
    const session = require("web.session");
    const _t = core._t;

    const Tooltip = {
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
            const $after_elem = $("<button>", {
                class: "fa fa fa-question-circle tooltip-icon text-info",
                role: "button",
            });

            $after_elem.on("click", function(e) {
                e.preventDefault();
                e.stopPropagation();
                self.do_action({
                    type: "ir.actions.act_window",
                    name: _t("Add a Tooltip"),
                    res_model: "ir.model.fields.tooltip",
                    target: "new",
                    views: [[false, "form"]],
                    view_mode: "form",
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
            const $after_elem = $("<button>", {
                class: "fa fa fa-question-circle tooltip-icon",
                role: "button",
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
                    self.do_action({
                        type: "ir.actions.act_window",
                        name: _t("Edit a Tooltip"),
                        res_model: "ir.model.fields.tooltip",
                        target: "new",
                        res_id: tooltip.id,
                        views: [[false, "form"]],
                        view_mode: "form",
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

    FormRenderer.include(
        Object.assign({}, Tooltip, {
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
        Object.assign({}, Tooltip, {
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

    FormController.include({
        init: function() {
            console.log("FormController");
            this._super.apply(this, arguments);
        },

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
