/* Copyright 2021 Tecnativa - Alexandre Díaz
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html) */

odoo.define(
    "web_widget_one2many_tree_line_duplicate.One2manyTreeLineDuplicate",
    function(require) {
        "use strict";

        const core = require("web.core");
        const FieldOne2Many = require("web.relational_fields").FieldOne2Many;
        const ListRenderer = require("web.ListRenderer");

        const _t = core._t;

        ListRenderer.include({
            events: _.extend({}, ListRenderer.prototype.events, {
                "click tr .o_list_record_clone": "_onCloneIconClick",
            }),

            /**
             * @override
             */
            init: function(parent) {
                this._super.apply(this, arguments);
                let allow_clone =
                    parent.attrs &&
                    parent.attrs.options &&
                    parent.attrs.options.allow_clone;
                allow_clone = typeof allow_clone === "undefined" ? false : allow_clone;
                this.addCloneIcon =
                    allow_clone &&
                    !parent.isReadonly &&
                    parent.activeActions &&
                    parent.activeActions.create;
            },

            /**
             * @private
             * @override
             */
            _renderHeader: function() {
                var $thead = this._super.apply(this, arguments);
                if (this.addCloneIcon) {
                    $thead
                        .find("tr")
                        .append($("<th>", {class: "o_list_record_clone_header"}));
                }
                return $thead;
            },

            /**
             * @override
             * @private
             */
            _renderFooter: function() {
                const $footer = this._super.apply(this, arguments);
                if (this.addCloneIcon) {
                    $footer.find("tr").append($("<td>"));
                }
                return $footer;
            },

            /**
             * Inject the icon for clone action
             *
             * @private
             * @override
             */
            _renderRow: function(record, index) {
                const $row = this._super.apply(this, arguments);
                if (this.addCloneIcon) {
                    const $icon = $("<button>", {
                        class: "fa fa-clone",
                        name: "clone",
                        "aria-label": _t("Clone row ") + (index + 1),
                    });
                    const $td = $("<td>", {class: "o_list_record_clone"}).append($icon);
                    $row.append($td);
                }
                return $row;
            },

            /**
             * @private
             * @override
             */
            _getNumberOfCols: function() {
                var n = this._super();
                if (this.addCloneIcon) {
                    n++;
                }
                return n;
            },

            /**
             * Trigger the clonation of the record
             *
             * @param {MouseEvent} ev
             */
            _onCloneIconClick: function(ev) {
                ev.preventDefault();
                ev.stopPropagation();
                var $row = $(ev.target).closest("tr");
                var id = $row.data("id");
                this.unselectRow().then(() => {
                    this.trigger_up("clone_record", {
                        context: ev.currentTarget.dataset.context && [
                            ev.currentTarget.dataset.context,
                        ],
                        id: id,
                    });
                });
            },
        });

        FieldOne2Many.include({
            custom_events: _.extend({}, FieldOne2Many.prototype.custom_events, {
                clone_record: "_onCloneRecord",
            }),

            /**
             * @param {CustomEvent} ev
             */
            _onCloneRecord: function(ev) {
                const data = ev.data || {};
                ev.stopPropagation();
                if (!this.cloningRecord && this.activeActions.create) {
                    this.cloningRecord = true;
                    this.trigger_up("edited_list", {id: this.value.id});
                    this._setValue(
                        {
                            operation: "CLONE", // This operation is a special case implemented only in this module
                            position: "bottom",
                            context: data.context,
                            id: ev.data.id,
                        },
                        {
                            allowWarning: data.allowWarning,
                        }
                    )
                        .then(() => {
                            this.cloningRecord = false;
                        })
                        .then(() => {
                            // This is necessary to propagate the changes
                            // to the main record
                            this._setValue({
                                operation: "TRIGGER_ONCHANGE",
                            });
                        })
                        .then(() => {
                            if (data.onSuccess) {
                                data.onSuccess();
                            }
                        })
                        .guardedCatch(() => {
                            this.cloningRecord = false;
                        });
                }
            },
        });
    }
);
