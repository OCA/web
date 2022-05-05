/* Copyright 2016 0k.io,ACSONE SA/NV
 * Copyright 2022 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define("web_m2x_options.web_m2x_options", function(require) {
    "use strict";

    const core = require("web.core"),
        data = require("web.data"),
        Dialog = require("web.Dialog"),
        view_dialogs = require("web.view_dialogs"),
        relational_fields = require("web.relational_fields"),
        rpc = require("web.rpc");

    const _t = core._t,
        FieldMany2ManyTags = relational_fields.FieldMany2ManyTags,
        FieldMany2One = relational_fields.FieldMany2One,
        FormFieldMany2ManyTags = relational_fields.FormFieldMany2ManyTags;

    // Launch the query ASAP
    const web_m2x_options = rpc.query({
        model: "ir.config_parameter",
        method: "get_web_m2x_options",
    });

    /**
     * Cloned from web/static/src/js/fields/relational_fields.js
     */
    const M2ODialog = Dialog.extend({
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
        /**
         * @override
         */
        init: function() {
            this.ir_options = {};
            return this._super.apply(this, arguments);
        },

        /**
         * @override
         */
        start: function() {
            return this._super.apply(this, arguments).then(() => this.get_options());
        },

        /**
         * @returns {Promise}
         */
        get_options: function() {
            if (_.isEmpty(this.ir_options)) {
                return web_m2x_options.then(records => {
                    for (const record of records) {
                        this.ir_options[record.key] = record.value;
                    }
                });
            }
            return Promise.resolve();
        },

        /**
         * @param {String/Boolean/Undefined} option
         * @returns {Boolean}
         */
        is_option_set: function(option) {
            if (typeof option === "string") {
                return option.toLowerCase() === "true";
            } else if (typeof option === "boolean") {
                return option;
            }
            return false;
        },

        /**
         * @override
         */
        _onInputFocusout: function() {
            const m2o_dialog_opt =
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

        /**
         * @override
         */
        _search: function(search_val) {
            if (!search_val) {
                return this._super.apply(this, arguments);
            }
            const def = new Promise(resolve => {
                // Add options limit used to change number of selections record
                // returned.
                if (!_.isUndefined(this.ir_options["web_m2x_options.limit"])) {
                    this.limit = parseInt(this.ir_options["web_m2x_options.limit"], 10);
                }

                if (typeof this.nodeOptions.limit === "number") {
                    this.limit = this.nodeOptions.limit;
                }

                // Add options field_color and colors to color item(s) depending on field_color value
                this.field_color = this.nodeOptions.field_color;
                this.colors = this.nodeOptions.colors;

                const context = this.record.getContext(this.recordParams);
                const domain = this.record.getDomain(this.recordParams);

                const blacklisted_ids = this._getSearchBlacklist();
                if (blacklisted_ids.length > 0) {
                    domain.push(["id", "not in", blacklisted_ids]);
                }

                this._rpc({
                    model: this.field.relation,
                    method: "name_search",
                    kwargs: {
                        name: search_val,
                        args: domain,
                        operator: "ilike",
                        limit: this.limit + 1,
                        context: context,
                    },
                }).then(result => {
                    // Possible selections for the m2o
                    let values = _.map(result, x => {
                        x[1] = this._getDisplayName(x[1]);
                        return {
                            label:
                                _.str.escapeHTML(x[1].trim()) || data.noDisplayContent,
                            value: x[1],
                            name: x[1],
                            id: x[0],
                        };
                    });

                    // Search result value colors
                    if (this.colors && this.field_color) {
                        const value_ids = _.map(values, value => value.id);
                        this._rpc({
                            model: this.field.relation,
                            method: "search_read",
                            fields: [this.field_color],
                            domain: [["id", "in", value_ids]],
                        }).then(objects => {
                            for (const index in objects) {
                                for (const index_value in values) {
                                    if (values[index_value].id === objects[index].id) {
                                        // Find value in values by comparing ids
                                        const value = values[index_value];
                                        // Find color with field value as key
                                        const color =
                                            this.colors[
                                                objects[index][this.field_color]
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
                    const can_search_more =
                            this.nodeOptions &&
                            this.is_option_set(this.nodeOptions.search_more),
                        search_more_undef =
                            _.isUndefined(this.nodeOptions.search_more) &&
                            _.isUndefined(
                                this.ir_options["web_m2x_options.search_more"]
                            ),
                        search_more = this.is_option_set(
                            this.ir_options["web_m2x_options.search_more"]
                        );

                    if (
                        (values.length > this.limit &&
                            (can_search_more || search_more_undef)) ||
                        search_more
                    ) {
                        values = values.slice(0, this.limit);
                        values.push({
                            label: _t("Search More..."),
                            action: () => {
                                let prom = Promise.resolve();
                                if (search_val) {
                                    prom = this._rpc({
                                        model: this.field.relation,
                                        method: "name_search",
                                        kwargs: {
                                            name: search_val,
                                            args: domain,
                                            operator: "ilike",
                                            limit: this.SEARCH_MORE_LIMIT,
                                            context: context,
                                        },
                                    });
                                }
                                prom.then(results => {
                                    let dynamicFilters = [];
                                    if (results) {
                                        const ids = _.map(results, x => x[0]);
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
                                        }
                                    }
                                    this._searchCreatePopup(
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

                    const create_enabled =
                        this.can_create && !this.nodeOptions.no_create;
                    // Quick create
                    const raw_result = _.map(result, x => x[1]);
                    const quick_create = this.is_option_set(this.nodeOptions.create),
                        quick_create_undef = _.isUndefined(this.nodeOptions.create),
                        m2x_create_undef = _.isUndefined(
                            this.ir_options["web_m2x_options.create"]
                        ),
                        m2x_create = this.is_option_set(
                            this.ir_options["web_m2x_options.create"]
                        );
                    const show_create =
                        (!this.nodeOptions && (m2x_create_undef || m2x_create)) ||
                        (this.nodeOptions &&
                            (quick_create ||
                                (quick_create_undef &&
                                    (m2x_create_undef || m2x_create))));
                    if (
                        create_enabled &&
                        !this.nodeOptions.no_quick_create &&
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
                            action: this._quickCreate.bind(this, search_val),
                            classname: "o_m2o_dropdown_option",
                        });
                    }
                    // Create and edit ...

                    const create_edit =
                            this.is_option_set(this.nodeOptions.create) ||
                            this.is_option_set(this.nodeOptions.create_edit),
                        create_edit_undef =
                            _.isUndefined(this.nodeOptions.create) &&
                            _.isUndefined(this.nodeOptions.create_edit),
                        m2x_create_edit_undef = _.isUndefined(
                            this.ir_options["web_m2x_options.create_edit"]
                        ),
                        m2x_create_edit = this.is_option_set(
                            this.ir_options["web_m2x_options.create_edit"]
                        );
                    const show_create_edit =
                        (!this.nodeOptions &&
                            (m2x_create_edit_undef || m2x_create_edit)) ||
                        (this.nodeOptions &&
                            (create_edit ||
                                (create_edit_undef &&
                                    (m2x_create_edit_undef || m2x_create_edit))));
                    if (
                        create_enabled &&
                        !this.nodeOptions.no_create_edit &&
                        show_create_edit
                    ) {
                        values.push({
                            label: _t("Create and Edit..."),
                            action: () => {
                                // Clear the value in case the user clicks on discard
                                this.$("input").val("");
                                return this._searchCreatePopup(
                                    "form",
                                    false,
                                    this._createContext(search_val)
                                );
                            },
                            classname: "o_m2o_dropdown_option",
                        });
                    } else if (values.length === 0) {
                        values.push({
                            label: _t("No results to show..."),
                        });
                    }
                    // Check if colors specified to wait for RPC
                    if (!(this.field_color && this.colors)) {
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

        /**
         * @override
         */
        _onDeleteTag: function(event) {
            const result = this._super.apply(this, arguments);
            event.stopPropagation();
            return result;
        },

        /**
         * @param {String/Boolean/Undefined} option
         * @returns {Boolean}
         */
        is_option_set: function(option) {
            if (typeof option === "string") {
                return option.toLowerCase() === "true";
            }
            if (typeof option === "boolean") {
                return option;
            }
            return false;
        },

        _onOpenBadge: function(event) {
            const open = this.nodeOptions && this.is_option_set(this.nodeOptions.open);
            if (open) {
                const context = this.record.getContext(this.recordParams);
                const id = Number($(event.currentTarget).data("id"));

                if (this.mode === "readonly") {
                    event.preventDefault();
                    event.stopPropagation();
                    this._rpc({
                        model: this.field.relation,
                        method: "get_formview_action",
                        args: [[id]],
                        context: context,
                    }).then(action => {
                        this.trigger_up("do_action", {action: action});
                    });
                } else {
                    Promise.all([
                        this._rpc({
                            model: this.field.relation,
                            method: "get_formview_id",
                            args: [[id]],
                            context: context,
                        }),
                        this._rpc({
                            model: this.field.relation,
                            method: "check_access_rights",
                            kwargs: {operation: "write", raise_exception: false},
                        }),
                    ]).then((view_id, write_access) => {
                        const can_write =
                            "can_write" in this.attrs
                                ? JSON.parse(this.attrs.can_write)
                                : true;
                        new view_dialogs.FormViewDialog(this, {
                            res_model: this.field.relation,
                            res_id: id,
                            context: context,
                            title: _t("Open: ") + this.string,
                            view_id: view_id,
                            readonly: !can_write || !write_access,
                            on_saved: (record, changed) => {
                                if (changed) {
                                    this._setValue(this.value.data, {
                                        forceChange: true,
                                    });
                                    this.trigger_up("reload", {db_id: this.value.id});
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
            const open = this.is_option_set(this.nodeOptions.open);
            const no_color_picker = this.is_option_set(
                this.nodeOptions.no_color_picker
            );
            if (!open && !no_color_picker) {
                this._onOpenColorPicker(event);
            } else {
                event.preventDefault();
                event.stopPropagation();
            }
        },
    });
});
