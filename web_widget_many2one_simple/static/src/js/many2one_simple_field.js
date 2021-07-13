odoo.define("web_widget_many2one_simple.FieldMany2OneSimple", function (require) {
    "use strict";

    const core = require("web.core");
    const Dialog = require("web.Dialog");
    const dialogs = require("web.view_dialogs");
    const AbstractField = require("web.AbstractField");
    const field_registry = require("web.field_registry");

    const _t = core._t;
    const _lt = core._lt;

    const FieldMany2OneSimple = AbstractField.extend({
        description: _lt("Many2one Simple"),
        supportedFieldTypes: ["many2one"],
        template: "web_widget_many2one_simple.FieldMany2OneSimple",
        custom_events: _.extend({}, AbstractField.prototype.custom_events, {
            quick_create: "_onQuickCreate",
            field_changed: "_onFieldChanged",
        }),
        events: _.extend({}, AbstractField.prototype.events, {
            "focusout input": "_onInputFocusout",
            "keyup input": "_onInputKeyup",
            "click .o_external_button": "_onExternalButtonClick",
            click: "_onClick",
        }),

        /**
         * @override
         */
        init: function (parent, name, record, options) {
            this._super.apply(this, arguments);

            this.can_create =
                ("can_create" in this.attrs
                    ? JSON.parse(this.attrs.can_create)
                    : true) && !this.nodeOptions.no_create;
            this.can_write =
                "can_write" in this.attrs ? JSON.parse(this.attrs.can_write) : true;
            this.regex =
                !this.nodeOptions.no_regex && "regex" in this.attrs
                    ? new RegExp(this.attrs.regex)
                    : undefined;

            this.nodeOptions = _.defaults(this.nodeOptions, {
                search: {
                    field: "id",
                    oper: "=",
                },
            });
            this.noOpen =
                "noOpen" in (options || {}) ? options.noOpen : this.nodeOptions.no_open;
            this.search =
                "search" in (options || {}) ? options.search : this.nodeOptions.search;
        },

        /**
         * @override
         */
        start: function () {
            this.$input = this.$("input");
            this.$external_button = this.$(".o_external_button");
            return this._super.apply(this, arguments);
        },

        /**
         * @param {Object} value (format: {id: ..., display_name: ...})
         * @returns {Promise}
         */
        reinitialize: function (value) {
            this.isDirty = false;
            return this._setValue(value).then(() => {
                const formatted_value = this._formatValue(this.value);
                this.$input.val(formatted_value);
            });
        },

        /**
         * @returns {Promise}
         */
        _search: function () {
            if (!this.isDirty) {
                return Promise.resolve();
            }
            const search_value = this.$input.val();
            if (search_value === "") {
                this.reinitialize(false);
                return Promise.resolve(false);
            }

            if (this.regex && !this.regex.test(search_value)) {
                this._showErrorMessage(_t("The given search criteria is not valid."));
                this.reinitialize(false);
                return Promise.resolve(false);
            }

            const context = this.record.getContext(
                _.extend({}, this.recordParams, {
                    additionalContext: this.attrs.context || {},
                })
            );
            context.many2one_simple = true;
            const domain = this.record.getDomain(this.recordParams);

            return this._rpc({
                model: this.field.relation,
                method: "search_read",
                fields: ["display_name"],
                domain: _.union(domain, this._getDomain()),
                limit: 1,
                kwargs: {context: context},
            }).then((results) => {
                if (_.isEmpty(results)) {
                    if (this.can_create) {
                        const create_context = _.extend({}, this.attrs.context);
                        if (this.search.field !== "id") {
                            create_context[
                                "default_" + this.search.field
                            ] = this.$input.val();
                        }
                        this._createPopup("form", create_context);
                    } else {
                        this._showErrorMessage(
                            _t("Can't found any record with the given criteria.")
                        );
                    }
                    this.reinitialize(false);
                } else {
                    this.reinitialize(results[0]);
                }
            });
        },

        /**
         * @private
         */
        _renderEdit: function () {
            const value = this._formatValue(this.value);
            this.$input.val(value);
            this._updateExternalButton();
        },

        /**
         * @private
         */
        _renderReadonly: function () {
            const value = this._formatValue(this.value);
            const escapedValue = _.escape((value || "").trim());
            const mapvalue = escapedValue
                .split("\n")
                .map(function (line) {
                    return "<span>" + line + "</span>";
                })
                .join("<br/>");
            this.$el.html(mapvalue);
            if (!this.noOpen && this.value) {
                this.$el.attr(
                    "href",
                    _.str.sprintf(
                        "#id=%s&model=%s",
                        this.value.res_id,
                        this.field.relation
                    )
                );
                this.$el.addClass("o_form_uri");
            }
        },

        /**
         * Show a message to the user
         *
         * @private
         * @param {String} error
         */
        _showErrorMessage: function (error) {
            Dialog.alert(this, error, {
                title: _t("Many2One Simple"),
            });
        },

        /**
         * Prepares and returns options for SelectCreateDialog
         *
         * @private
         * @param {String} view
         * @param {Object} context
         * @returns {Object}
         */
        _getCreatePopupOptions: function (view, context) {
            return {
                res_model: this.field.relation,
                domain: this.record.getDomain({fieldName: this.name}),
                context: _.extend(
                    {},
                    this.record.getContext(this.recordParams),
                    context || {}
                ),
                dynamicFilters: [],
                title: _t("Create: ") + this.string,
                initial_view: view,
                disable_multiple_selection: true,
                no_create: !this.can_create,
                kanban_view_ref: this.attrs.kanban_view_ref,
                on_selected: (records) => this.reinitialize(records[0]),
                on_closed: () => this.activate(),
            };
        },

        /**
         * Create popup handling
         *
         * @private
         * @param {any} view
         * @param {any} context
         * @returns {DialogClass}
         */
        _createPopup: function (view, context) {
            const options = this._getCreatePopupOptions(view, context);
            return new dialogs.SelectCreateDialog(
                this,
                _.extend({}, this.nodeOptions, options)
            ).open();
        },

        /**
         * Construct the domain used to found the related record
         *
         * @private
         * @returns {Array}
         */
        _getDomain: function () {
            return [[this.search.field, this.search.oper, this.$input.val()]];
        },

        /**
         * @private
         * @param {OdooEvent} event 'field_changed' event
         */
        _onFieldChanged: function (event) {
            this.$input.val(event.data.changes[this.name].display_name);
        },

        /**
         * @private
         */
        _onExternalButtonClick: function () {
            if (!this.value) {
                this.activate();
                return;
            }
            const context = this.record.getContext(
                _.extend({}, this.recordParams, {
                    additionalContext: this.attrs.context || {},
                })
            );
            this._rpc({
                model: this.field.relation,
                method: "get_formview_id",
                args: [[this.value.res_id]],
                context: context,
            }).then((view_id) => {
                new dialogs.FormViewDialog(this, {
                    res_model: this.field.relation,
                    res_id: this.value.res_id,
                    context: context,
                    title: _t("Open: ") + this.string,
                    view_id: view_id,
                    readonly: !this.can_write,
                    on_saved: (record, changed) => {
                        if (changed) {
                            const _setValue = this._setValue.bind(
                                this,
                                this.value.data,
                                {
                                    forceChange: true,
                                }
                            );
                            this.trigger_up("reload", {
                                db_id: this.value.id,
                                onSuccess: _setValue,
                                onFailure: _setValue,
                            });
                        }
                    },
                }).open();
            });
        },

        /**
         * @private
         * @param {MouseEvent} event
         */
        _onClick: function (event) {
            if (this.mode === "readonly" && !this.noOpen) {
                event.preventDefault();
                event.stopPropagation();
                this._rpc({
                    model: this.field.relation,
                    method: "get_formview_action",
                    args: [[this.value.res_id]],
                    context: this.record.getContext(this.recordParams),
                }).then((action) => {
                    this.trigger_up("do_action", {action: action});
                });
            }
        },

        /**
         * @private
         */
        _onInputFocusout: function () {
            this._search();
        },

        /**
         * @private
         *
         * @param {OdooEvent} ev
         */
        _onInputKeyup: function (ev) {
            if (ev.which === $.ui.keyCode.ENTER || ev.which === $.ui.keyCode.TAB) {
                this._search();
            } else {
                this.isDirty = true;
            }
        },

        /**
         * @private
         */
        _updateExternalButton: function () {
            const has_external_button = !this.noOpen && !this.floating && this.isSet();
            this.$external_button.toggle(has_external_button);
        },
    });

    field_registry.add("many2one_simple", FieldMany2OneSimple);

    return FieldMany2OneSimple;
});
