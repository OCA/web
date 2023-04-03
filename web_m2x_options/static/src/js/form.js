/* Copyright 2016 0k.io,ACSONE SA/NV
 *  * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define("web_m2x_options.web_m2x_options", function (require) {
    "use strict";
    var core = require("web.core"),
        data = require("web.data"),
        Dialog = require("web.Dialog"),
        FormView = require("web.FormView"),
        view_dialogs = require("web.view_dialogs"),
        relational_fields = require("web.relational_fields"),
        ir_options = require("web_m2x_options.ir_options");

    const {escape} = owl.utils;
    const {sprintf} = require("web.utils");
    var _t = core._t,
        FieldMany2ManyTags = relational_fields.FieldMany2ManyTags,
        FieldMany2One = relational_fields.FieldMany2One,
        FieldOne2Many = relational_fields.FieldOne2Many,
        FormFieldMany2ManyTags = relational_fields.FormFieldMany2ManyTags;

    function is_option_set(option) {
        if (_.isUndefined(option)) {
            return false;
        }
        if (typeof option === "string") {
            return option === "true" || option === "True";
        }
        if (typeof option === "boolean") {
            return option;
        }
        return false;
    }

    var M2ODialog = Dialog.extend({
        template: "M2ODialog",
        init: function (parent, name, value) {
            this.name = name;
            this.value = value;

            const buttons = [];

            if (parent._canCreate() && parent._canShowDialogQuickCreate()) {
                buttons.push({
                    text: _t("Create"),
                    classes: "btn-primary",
                    close: true,
                    click: function () {
                        this.trigger_up("quick_create", {value: this.value});
                    },
                });
            }

            if (parent._canCreate() && parent._canShowDialogCreateAndEdit()) {
                buttons.push({
                    text: _t("Create and edit"),
                    classes: "btn-primary",
                    close: true,
                    click: function () {
                        this.trigger_up("search_create_popup", {
                            view_type: "form",
                            value: this.value,
                        });
                    },
                });
            }

            buttons.push({
                text: _t("Cancel"),
                close: true,
            });

            this._super(parent, {
                title: _.str.sprintf(_t("Create a %s"), this.name),
                size: "medium",
                buttons: buttons,
            });
        },
        start: function () {
            this.$("p").text(
                _.str.sprintf(
                    _t(
                        "You are creating a new %s, are you sure it does not exist yet?"
                    ),
                    this.name
                )
            );
            this.$("input").val(this.value);
        },
        /**
         * @override
         * @param {Boolean} isSet
         */
        close: function (isSet) {
            this.isSet = isSet;
            this._super.apply(this, arguments);
        },
        /**
         * @override
         */
        destroy: function () {
            if (!this.isSet) {
                this.trigger_up("closed_unset");
            }
            this._super.apply(this, arguments);
        },
    });

    FieldMany2One.include({
        custom_events: _.extend({}, FieldMany2One.prototype.custom_events, {
            search_create_popup: "_onSearchCreatePopup",
        }),

        _canCreate: function () {
            return this.can_create && !this.nodeOptions.no_create;
        },

        _canShowQuickCreate: function () {
            var quick_create = is_option_set(this.nodeOptions.create),
                quick_create_undef = _.isUndefined(this.nodeOptions.create),
                m2x_create_undef = _.isUndefined(ir_options["web_m2x_options.create"]),
                m2x_create = is_option_set(ir_options["web_m2x_options.create"]);

            if (!quick_create_undef) {
                return quick_create;
            }

            if (!_.isUndefined(this.nodeOptions.no_quick_create))
                return !this.nodeOptions.no_quick_create;

            if (!m2x_create_undef) {
                return m2x_create;
            }

            return true;
        },

        _canShowCreateAndEdit: function () {
            var create_edit =
                    is_option_set(this.nodeOptions.create) ||
                    is_option_set(this.nodeOptions.create_edit) ||
                    !is_option_set(this.nodeOptions.no_create_edit),
                create_edit_undef =
                    _.isUndefined(this.nodeOptions.create) &&
                    _.isUndefined(this.nodeOptions.create_edit) &&
                    _.isUndefined(this.nodeOptions.no_create_edit),
                m2x_create_edit_undef = _.isUndefined(
                    ir_options["web_m2x_options.create_edit"]
                ),
                m2x_create_edit = is_option_set(
                    ir_options["web_m2x_options.create_edit"]
                );

            if (!create_edit_undef) {
                return create_edit;
            }

            if (!m2x_create_edit_undef) {
                return m2x_create_edit;
            }

            return true;
        },

        _canFilterDialogRemoveButtons: function () {
            var m2o_dialog_remove_buttons_undef = _.isUndefined(
                    ir_options["web_m2x_options.m2o_dialog_remove_buttons"]
                ),
                m2o_dialog_remove_buttons = is_option_set(
                    ir_options["web_m2x_options.m2o_dialog_remove_buttons"]
                );
            if (!m2o_dialog_remove_buttons_undef) {
                return m2o_dialog_remove_buttons;
            }
            return false;
        },

        _canShowDialogQuickCreate: function () {
            return this._canShowQuickCreate() && this._canFilterDialogRemoveButtons();
        },

        _canShowDialogCreateAndEdit: function () {
            return this._canShowCreateAndEdit() && this._canFilterDialogRemoveButtons();
        },

        /**
         * @private
         * @param {OdooEvent} event
         * @returns {Array}
         */
        _onSearchCreatePopup: function (event) {
            const valueContext = this._createContext(event.data.value);
            this.el.querySelector(":scope input").value = "";
            return this._searchCreatePopup("form", false, valueContext);
        },

        _onInputFocusout: function () {
            var m2o_dialog_opt =
                is_option_set(this.nodeOptions.m2o_dialog) ||
                (_.isUndefined(this.nodeOptions.m2o_dialog) &&
                    is_option_set(ir_options["web_m2x_options.m2o_dialog"])) ||
                (_.isUndefined(this.nodeOptions.m2o_dialog) &&
                    _.isUndefined(ir_options["web_m2x_options.m2o_dialog"]));
            if (this.floating && m2o_dialog_opt) {
                if (
                    !this._canCreate() ||
                    (!this._canShowDialogQuickCreate() &&
                        !this._canShowDialogCreateAndEdit())
                ) {
                    // If we cannot carry out either create or create and edit
                    // actions then we should not show the dialog and we should zero
                    // out the input
                    this.el.querySelector(":scope input").value = "";
                    return;
                }

                new M2ODialog(this, this.string, this.$input.val()).open();
            }
        },

        _search: function (searchValue) {
            var self = this;
            // Add options limit used to change number of selections record returned.
            if (!_.isUndefined(ir_options["web_m2x_options.limit"])) {
                self.limit = Number(ir_options["web_m2x_options.limit"]);
            }

            if (typeof self.nodeOptions.limit === "number") {
                self.limit = self.nodeOptions.limit;
            }

            var def = new Promise((resolve) => {
                const value = searchValue.trim();
                const domain = self.record.getDomain(self.recordParams);
                const context = Object.assign(
                    self.record.getContext(self.recordParams),
                    self.additionalContext
                );

                // Exclude black-listed ids from the domain
                const blackListedIds = self._getSearchBlacklist();
                if (blackListedIds.length) {
                    domain.push(["id", "not in", blackListedIds]);
                }

                self._rpc({
                    model: self.field.relation,
                    method: "name_search",
                    kwargs: {
                        name: value,
                        args: domain,
                        operator: "ilike",
                        limit: self.limit + 1,
                        context,
                    },
                }).then((results) => {
                    // Format results to fit the options dropdown
                    let values = _.map(results, (result) => {
                        const [id, fullName] = result;
                        const displayName = self._getDisplayName(fullName).trim();
                        result[1] = displayName;
                        return {
                            id,
                            label: escape(displayName) || data.noDisplayContent,
                            value: displayName,
                            name: displayName,
                        };
                    });

                    // Search more...
                    // Resolution order:
                    // 1- check if "search_more" is set locally in node's options
                    // 2- if set locally, apply its value
                    // 3- if not set locally, check if it's set globally via ir.config_parameter
                    // 4- if set globally, apply its value
                    // 5- if not set globally either, check if returned values are more than node's limit
                    var search_more = false;
                    if (!_.isUndefined(self.nodeOptions.search_more)) {
                        search_more = is_option_set(self.nodeOptions.search_more);
                    } else if (
                        !_.isUndefined(ir_options["web_m2x_options.search_more"])
                    ) {
                        search_more = is_option_set(
                            ir_options["web_m2x_options.search_more"]
                        );
                    } else {
                        search_more = values.length > self.limit;
                    }

                    // Add "Search more..." option if results count is higher than the limit
                    if (search_more) {
                        values = self._manageSearchMore(values, value, domain, context);
                    }

                    if (value.length) {
                        // "Quick create" option
                        const nameExists = results.some(
                            (result) => result[1] === value
                        );
                        if (self._canShowQuickCreate() && !nameExists) {
                            values.push({
                                label: sprintf(
                                    _t(`Create "<strong>%s</strong>"`),
                                    escape(value)
                                ),
                                action: () => this._quickCreate(value),
                                classname: "o_m2o_dropdown_option",
                            });
                        }
                        // "Create and Edit" option
                        if (self._canShowCreateAndEdit()) {
                            const valueContext = this._createContext(value);
                            values.push({
                                label: _t("Create and Edit..."),
                                action: () => {
                                    // Input value is cleared and the form popup opens
                                    self.el.querySelector(":scope input").value = "";
                                    return self._searchCreatePopup(
                                        "form",
                                        false,
                                        valueContext
                                    );
                                },
                                classname: "o_m2o_dropdown_option",
                            });
                        }
                        // "No results" option
                        if (!values.length) {
                            values.push({
                                label: _t("No records"),
                                classname: "o_m2o_no_result",
                            });
                        }
                    } else if (!self.value && self._canShowQuickCreate()) {
                        // "Start typing" option
                        values.push({
                            label: _t("Start typing..."),
                            classname: "o_m2o_start_typing",
                        });
                    }

                    // Check if colors specified to wait for RPC
                    if (!(self.field_color && self.colors)) {
                        resolve(values);
                    }

                    return values;
                });
            });
            this.orderer.add(def);
            return def;
        },
    });

    FieldMany2ManyTags.include({
        events: _.extend({}, FieldMany2ManyTags.prototype.events, {
            "click .badge": "_onOpenBadge",
        }),

        _onDeleteTag: function (event) {
            var result = this._super.apply(this, arguments);
            event.stopPropagation();
            return result;
        },

        _onOpenBadge: function (event) {
            var self = this;
            var open = self.nodeOptions && is_option_set(self.nodeOptions.open);
            if (open) {
                var context = self.record.getContext(self.recordParams);
                var id = parseInt($(event.currentTarget).data("id"), 10);

                if (self.mode === "readonly") {
                    event.preventDefault();
                    event.stopPropagation();
                    self._rpc({
                        model: self.field.relation,
                        method: "get_formview_action",
                        args: [[id]],
                        context: context,
                    }).then(function (action) {
                        self.trigger_up("do_action", {action: action});
                    });
                } else {
                    $.when(
                        self._rpc({
                            model: self.field.relation,
                            method: "get_formview_id",
                            args: [[id]],
                            context: context,
                        }),
                        self._rpc({
                            model: self.field.relation,
                            method: "check_access_rights",
                            kwargs: {operation: "write", raise_exception: false},
                        })
                    ).then(function (view_id, write_access) {
                        var can_write =
                            "can_write" in self.attrs
                                ? JSON.parse(self.attrs.can_write)
                                : true;
                        new view_dialogs.FormViewDialog(self, {
                            res_model: self.field.relation,
                            res_id: id,
                            context: context,
                            title: _t("Open: ") + self.string,
                            view_id: view_id,
                            readonly: !can_write || !write_access,
                            on_saved: function (record, changed) {
                                if (changed) {
                                    self._setValue(self.value.data, {
                                        forceChange: true,
                                    });
                                    self.trigger_up("reload", {db_id: self.value.id});
                                }
                            },
                        }).open();
                    });
                }
            }
        },
    });

    FieldOne2Many.include({
        _onOpenRecord: function (ev) {
            var self = this;
            var open = this.nodeOptions.open;
            if (open && self.mode === "readonly") {
                ev.stopPropagation();
                var id = ev.data.id;
                var res_id = self.record.data[self.name].data.filter(
                    (line) => line.id === id
                )[0].res_id;
                self._rpc({
                    model: self.field.relation,
                    method: "get_formview_action",
                    args: [[res_id]],
                }).then(function (action) {
                    return self.do_action(action);
                });
            } else {
                return this._super.apply(this, arguments);
            }
        },
    });

    FormFieldMany2ManyTags.include({
        events: _.extend({}, FormFieldMany2ManyTags.prototype.events, {
            "click .badge": "_onOpenBadge",
        }),

        _onOpenBadge: function (event) {
            var open = is_option_set(this.nodeOptions.open);
            var no_color_picker = is_option_set(this.nodeOptions.no_color_picker);
            this._super.apply(this, arguments);
            if (!open && !no_color_picker) {
                this._onOpenColorPicker(event);
            } else {
                event.preventDefault();
                event.stopPropagation();
            }
        },
    });

    // Extending class to allow change the limit of o2m registry entries using the
    // system parameter "web_m2x_options.field_limit_entries".
    FormView.include({
        _setSubViewLimit: function (attrs) {
            this._super(attrs);
            var limit = ir_options["web_m2x_options.field_limit_entries"];
            if (!_.isUndefined(limit)) {
                attrs.limit = Number(limit);
            }
        },
    });
});
