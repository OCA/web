/* Copyright 2016 0k.io,ACSONE SA/NV
 *  * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define("web_m2x_options.web_m2x_options", function(require) {
    "use strict";

    var core = require("web.core"),
        data = require("web.data"),
        Dialog = require("web.Dialog"),
        view_dialogs = require("web.view_dialogs"),
        relational_fields = require("web.relational_fields"),
        rpc = require("web.rpc");

    var _t = core._t,
        FieldMany2ManyTags = relational_fields.FieldMany2ManyTags,
        FieldMany2One = relational_fields.FieldMany2One,
        FormFieldMany2ManyTags = relational_fields.FormFieldMany2ManyTags;

    var web_m2x_options = rpc.query({
        model: "ir.config_parameter",
        method: "get_web_m2x_options",
    });

    var M2ODialog = Dialog.extend({
        template: "M2ODialog",
        init: function(parent, name, value) {
            this.name = name;
            this.value = value;
            this._super(parent, {
                title: _.str.sprintf(_t("Create a %s"), this.name),
                size: "medium",
                buttons: [
                    {
                        text: _t("Create"),
                        classes: "btn-primary",
                        click: function() {
                            if (this.$("input").val() !== "") {
                                this.trigger_up("quick_create", {
                                    value: this.$("input").val(),
                                });
                                this.close(true);
                            } else {
                                this.$("input").focus();
                            }
                        },
                    },
                    {
                        text: _t("Create and edit"),
                        classes: "btn-primary",
                        close: true,
                        click: function() {
                            this.trigger_up("search_create_popup", {
                                view_type: "form",
                                value: this.$("input").val(),
                            });
                        },
                    },
                    {
                        text: _t("Cancel"),
                        close: true,
                    },
                ],
            });
        },
        start: function() {
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
        close: function(isSet) {
            this.isSet = isSet;
            this._super.apply(this, arguments);
        },
        /**
         * @override
         */
        destroy: function() {
            if (!this.isSet) {
                this.trigger_up("closed_unset");
            }
            this._super.apply(this, arguments);
        },
    });

    FieldMany2One.include({
        start: function() {
            this._super.apply(this, arguments);
            return this.get_options();
        },

        get_options: function() {
            var self = this;
            if (_.isUndefined(this.ir_options_loaded)) {
                this.ir_options_loaded = $.Deferred();
                this.ir_options = {};
                web_m2x_options.then(function(records) {
                    _(records).each(function(record) {
                        self.ir_options[record.key] = record.value;
                    });
                    self.ir_options_loaded.resolve();
                });
            }
            return $.when();
        },

        is_option_set: function(option) {
            if (_.isUndefined(option)) return false;
            if (typeof option === "string")
                return option === "true" || option === "True";
            if (typeof option === "boolean") return option;
            return false;
        },

        _onInputFocusout: function() {
            var m2o_dialog_opt =
                this.is_option_set(this.nodeOptions.m2o_dialog) ||
                (_.isUndefined(this.nodeOptions.m2o_dialog) &&
                    this.is_option_set(
                        this.ir_options["web_m2x_options.m2o_dialog"]
                    )) ||
                (_.isUndefined(this.nodeOptions.m2o_dialog) &&
                    _.isUndefined(this.ir_options["web_m2x_options.m2o_dialog"]));
            if (this.can_create && this.floating && m2o_dialog_opt) {
                new M2ODialog(this, this.string, this.$input.val()).open();
            }
        },

        _search: function(search_val) {
            var self = this;
            var def = new Promise(resolve => {
                // Add options limit used to change number of selections record
                // returned.
                if (!_.isUndefined(self.ir_options["web_m2x_options.limit"])) {
                    this.limit = parseInt(self.ir_options["web_m2x_options.limit"], 10);
                }

                if (typeof self.nodeOptions.limit === "number") {
                    self.limit = self.nodeOptions.limit;
                }

                // Add options field_color and colors to color item(s) depending on field_color value
                self.field_color = self.nodeOptions.field_color;
                self.colors = self.nodeOptions.colors;

                var context = self.record.getContext(self.recordParams);
                var domain = self.record.getDomain(self.recordParams);

                var blacklisted_ids = self._getSearchBlacklist();
                if (blacklisted_ids.length > 0) {
                    domain.push(["id", "not in", blacklisted_ids]);
                }

                self._rpc({
                    model: self.field.relation,
                    method: "name_search",
                    kwargs: {
                        name: search_val,
                        args: domain,
                        operator: "ilike",
                        limit: self.limit + 1,
                        context: context,
                    },
                }).then(result => {
                    // Possible selections for the m2o
                    var values = _.map(result, x => {
                        x[1] = self._getDisplayName(x[1]);
                        return {
                            label:
                                _.str.escapeHTML(x[1].trim()) || data.noDisplayContent,
                            value: x[1],
                            name: x[1],
                            id: x[0],
                        };
                    });

                    // Search result value colors
                    if (self.colors && self.field_color) {
                        var value_ids = [];
                        for (var val_index in values) {
                            value_ids.push(values[val_index].id);
                        }
                        self._rpc({
                            model: self.field.relation,
                            method: "search_read",
                            fields: [self.field_color],
                            domain: [["id", "in", value_ids]],
                        }).then(objects => {
                            for (var index in objects) {
                                for (var index_value in values) {
                                    if (values[index_value].id === objects[index].id) {
                                        // Find value in values by comparing ids
                                        var value = values[index_value];
                                        // Find color with field value as key
                                        var color =
                                            self.colors[
                                                objects[index][self.field_color]
                                            ] || "black";
                                        value.label =
                                            '<span style="color:' +
                                            color +
                                            '">' +
                                            value.label +
                                            "</span>";
                                        break;
                                    }
                                }
                            }
                            resolve(values);
                        });
                    }

                    // Search more... if more results that max
                    var can_search_more =
                            self.nodeOptions &&
                            self.is_option_set(self.nodeOptions.search_more),
                        search_more_undef =
                            _.isUndefined(self.nodeOptions.search_more) &&
                            _.isUndefined(
                                self.ir_options["web_m2x_options.search_more"]
                            ),
                        search_more = self.is_option_set(
                            self.ir_options["web_m2x_options.search_more"]
                        );

                    if (values.length > self.limit) {
                        values = values.slice(0, self.limit);
                        if (can_search_more || search_more_undef || search_more) {
                            values.push({
                                label: _t("Search More..."),
                                action: function() {
                                    var prom = [];
                                    if (search_val !== "") {
                                        prom = self._rpc({
                                            model: self.field.relation,
                                            method: "name_search",
                                            kwargs: {
                                                name: search_val,
                                                args: domain,
                                                operator: "ilike",
                                                limit: self.SEARCH_MORE_LIMIT,
                                                context: context,
                                            },
                                        });
                                    }
                                    Promise.resolve(prom).then(function(results) {
                                        var dynamicFilters = [];
                                        if (results) {
                                            var ids = _.map(results, function(x) {
                                                return x[0];
                                            });
                                            if (search_val) {
                                                dynamicFilters = [
                                                    {
                                                        description: _.str.sprintf(
                                                            _t("Quick search: %s"),
                                                            search_val
                                                        ),
                                                        domain: [["id", "in", ids]],
                                                    },
                                                ];
                                            } else {
                                                dynamicFilters = [];
                                            }
                                        }
                                        self._searchCreatePopup(
                                            "search",
                                            false,
                                            {},
                                            dynamicFilters
                                        );
                                    });
                                },
                                classname: "o_m2o_dropdown_option",
                            });
                        }
                    }

                    var create_enabled = self.can_create && !self.nodeOptions.no_create;
                    // Quick create
                    var raw_result = _.map(result, function(x) {
                        return x[1];
                    });
                    var quick_create = self.is_option_set(self.nodeOptions.create),
                        quick_create_undef = _.isUndefined(self.nodeOptions.create),
                        m2x_create_undef = _.isUndefined(
                            self.ir_options["web_m2x_options.create"]
                        ),
                        m2x_create = self.is_option_set(
                            self.ir_options["web_m2x_options.create"]
                        );
                    var show_create =
                        (!self.nodeOptions && (m2x_create_undef || m2x_create)) ||
                        (self.nodeOptions &&
                            (quick_create ||
                                (quick_create_undef &&
                                    (m2x_create_undef || m2x_create))));
                    if (
                        create_enabled &&
                        !self.nodeOptions.no_quick_create &&
                        search_val.length > 0 &&
                        !_.contains(raw_result, search_val) &&
                        show_create
                    ) {
                        values.push({
                            label: _.str.sprintf(
                                _t('Create "<strong>%s</strong>"'),
                                $("<span />")
                                    .text(search_val)
                                    .html()
                            ),
                            action: self._quickCreate.bind(self, search_val),
                            classname: "o_m2o_dropdown_option",
                        });
                    }
                    // Create and edit ...

                    var create_edit =
                            self.is_option_set(self.nodeOptions.create) ||
                            self.is_option_set(self.nodeOptions.create_edit),
                        create_edit_undef =
                            _.isUndefined(self.nodeOptions.create) &&
                            _.isUndefined(self.nodeOptions.create_edit),
                        m2x_create_edit_undef = _.isUndefined(
                            self.ir_options["web_m2x_options.create_edit"]
                        ),
                        m2x_create_edit = self.is_option_set(
                            self.ir_options["web_m2x_options.create_edit"]
                        );
                    var show_create_edit =
                        (!self.nodeOptions &&
                            (m2x_create_edit_undef || m2x_create_edit)) ||
                        (self.nodeOptions &&
                            (create_edit ||
                                (create_edit_undef &&
                                    (m2x_create_edit_undef || m2x_create_edit))));
                    if (
                        create_enabled &&
                        !self.nodeOptions.no_create_edit &&
                        show_create_edit
                    ) {
                        var createAndEditAction = function() {
                            // Clear the value in case the user clicks on discard
                            self.$("input").val("");
                            return self._searchCreatePopup(
                                "form",
                                false,
                                self._createContext(search_val)
                            );
                        };
                        values.push({
                            label: _t("Create and Edit..."),
                            action: createAndEditAction,
                            classname: "o_m2o_dropdown_option",
                        });
                    } else if (values.length === 0) {
                        values.push({
                            label: _t("No results to show..."),
                        });
                    }
                    // Check if colors specified to wait for RPC
                    if (!(self.field_color && self.colors)) {
                        resolve(values);
                    }
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

        _onDeleteTag: function(event) {
            var result = this._super.apply(this, arguments);
            event.stopPropagation();
            return result;
        },

        is_option_set: function(option) {
            if (_.isUndefined(option)) return false;
            if (typeof option === "string")
                return option === "true" || option === "True";
            if (typeof option === "boolean") return option;
            return false;
        },

        _onOpenBadge: function(event) {
            var self = this;
            var open = self.nodeOptions && self.is_option_set(self.nodeOptions.open);
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
                    }).then(function(action) {
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
                    ).then(function(view_id, write_access) {
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
                            on_saved: function(record, changed) {
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

    FormFieldMany2ManyTags.include({
        events: _.extend({}, FormFieldMany2ManyTags.prototype.events, {
            "click .badge": "_onOpenBadge",
        }),

        _onOpenBadge: function(event) {
            var open = this.is_option_set(this.nodeOptions.open);
            var no_color_picker = this.is_option_set(this.nodeOptions.no_color_picker);
            this._super.apply(this, arguments);
            if (!open && !no_color_picker) {
                this._onOpenColorPicker(event);
            } else {
                event.preventDefault();
                event.stopPropagation();
            }
        },
    });
});
