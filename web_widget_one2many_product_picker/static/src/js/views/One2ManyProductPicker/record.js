/* global py */
// Copyright 2020 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define("web_widget_one2many_product_picker.One2ManyProductPickerRecord", function(
    require
) {
    "use strict";

    const core = require("web.core");
    const Widget = require("web.Widget");
    const Domain = require("web.Domain");
    const widgetRegistry = require("web.widget_registry");
    const tools = require("web_widget_one2many_product_picker.tools");
    const ProductPickerQuickModifPriceForm = require("web_widget_one2many_product_picker.ProductPickerQuickModifPriceForm");
    const config = require("web.config");

    const qweb = core.qweb;
    const _t = core._t;

    /* This represent a record (a card) */
    const One2ManyProductPickerRecord = Widget.extend({
        custom_events: {
            quick_record_updated: "_onQuickRecordUpdated",
            restore_flip_card: "_onRestoreFlipCard",
        },
        events: {
            "click .oe_flip_card": "_onClickFlipCard",
        },

        _click_card_delayed_time: 250,
        _onchange_delay: 250,

        /**
         * @override
         */
        init: function(parent, state, options) {
            this._super(parent);
            this.options = options;
            this.subWidgets = {};
            this._clickFlipCardCount = 0;
            this._setState(state, options.searchRecord);
            this.widgets = {
                front: [],
                back: [],
            };
            this._lazyUpdateRecord = _.debounce(this._updateRecord.bind(this), 450);
        },

        /**
         * Generates a new virtual state and recreates the product card
         *
         * @param {Boolean} simple_mode
         * @returns {Object}
         */
        generateVirtualState: function(simple_mode) {
            return this._generateVirtualState(undefined, undefined, simple_mode).then(
                this.recreate.bind(this)
            );
        },

        /**
         * @override
         */
        start: function() {
            return $.when(this._super.apply(this, arguments), this._render());
        },

        /**
         * @override
         */
        on_attach_callback: function() {
            _.invoke(this.subWidgets, "on_attach_callback");
        },

        /**
         * @override
         */
        on_detach_callback: function() {
            _.invoke(this.subWidgets, "on_detach_callback");
        },

        /**
         * @override
         */
        destroy: function() {
            this.abortTimeouts();
            if (this.state) {
                this.options.basicFieldParams.model.removeVirtualRecord(this.state.id);
            }
            this.$el.remove();
            this.$card.off("");
            this._super.apply(this, arguments);
        },

        abortTimeouts: function() {
            if (this._timerOnChange) {
                clearTimeout(this._timerOnChange);
                this._timerOnChange = false;
            }
            if (this.state) {
                const model = this.options.basicFieldParams.model;
                model.updateRecordContext(this.state.id, {aborted: true});
            }
        },

        /**
         * @override
         */
        update: function(record) {
            // Detach the widgets because the record will empty its $el, which
            // will remove all event handlers on its descendants, and we want
            // to keep those handlers alive as we will re-use these widgets
            _.invoke(_.pluck(this.subWidgets, "$el"), "detach");
            this._setState(record);
            return this._render();
        },

        /**
         * Re-creates the product card and updates the current state if have a
         * new one.
         *
         * @param {Object} state
         * @returns {Promise}
         */
        recreate: function(state) {
            if (!this.getParent()) {
                // It's a zombie record! ensure kill it!
                this.destroy();
                return;
            }

            if (state) {
                this._setState(state);
            }
            if (this.$card) {
                this.$card.removeClass("blocked");
                // Avoid recreate active record
                if (this.$card.hasClass("active")) {
                    this._processDynamicFields();
                    return $.when();
                }
            }

            this.on_detach_callback();
            return this._render();
        },

        markToDestroy: function() {
            this.toDestroy = true;
            this.$el.hide();
        },

        isMarkedToDestroy: function() {
            return this.toDestroy === true;
        },

        /**
         * Generates the URL for the given product using the selected field
         *
         * @private
         * @param {Number} product_id
         * @param {String} field_name
         * @returns {String}
         */
        _getImageUrl: function(product_id, field_name) {
            return _.str.sprintf(
                "/web/image/product.product/%d/%s",
                product_id,
                field_name
            );
        },

        /**
         * Prints the given field value using the selected format
         *
         * @private
         * @param {String} price_field
         * @returns {String}
         */
        _getMonetaryFieldValue: function(price_field) {
            const field_name = this.options.fieldMap[price_field];
            const price = this.state.data[field_name];
            return tools.monetary(
                price,
                this.state.fields[field_name],
                this.options.currencyField,
                this.options.basicFieldParams.record.data
            );
        },

        /**
         * Prints the given field value using the selected format
         *
         * @private
         * @param {String} price_field
         * @returns {String}
         */
        _getFloatFieldValue: function(field) {
            const field_name = this.options.fieldMap[field];
            const value = this.state.data[field_name];
            return tools.float(value, this.state.fields[field_name]);
        },

        /**
         * @private
         * @param {String} d a stringified domain
         * @returns {Boolean} the domain evaluted with the current values
         */
        _computeDomain: function(d) {
            return new Domain(d).compute(
                (this.state || this.getParent().state).evalContext
            );
        },

        /**
         * Store model info used to represent the data
         *
         * @private
         * @param {Object} viewState
         * @param {Object} recordSearch
         */
        _setState: function(viewState, recordSearch) {
            // No parent = product_pricker widget destroyed
            // So this is a 'zombie' record. Destroy it!
            if (!this.getParent()) {
                this.on_detach_callback();
                this.destroy();
                return;
            }

            this.fields = this.getParent().state.fields;
            this.fieldsInfo = this.getParent().state.fieldsInfo.form;
            const model = this.options.basicFieldParams.model;
            if (this.state && (!viewState || this.state.id !== viewState.id)) {
                model.removeVirtualRecord(this.state.id);
            }
            this.state = viewState;

            if (recordSearch) {
                this.recordSearch = recordSearch;
            }
            this.is_virtual =
                (this.state && model.isPureVirtual(this.state.id)) || false;

            // Check if has cached qty
            if (this.state && this.state.id) {
                const record = model.get(this.state.id);
                const lazy_qty = (record && record.context.lazy_qty) || 0;
                if (lazy_qty) {
                    model.updateRecordContext(this.state.id, {lazy_qty: 0});
                    // Record already has 1
                    this._incProductQty(lazy_qty - 1);
                }
            }

            this._setMasterUomMap();
        },

        /**
         * Used to know what is the "main" uom
         * @private
         */
        _setMasterUomMap: function() {
            this.master_uom_map = {
                field_uom: "product_uom",
                field_uom_qty: "product_uom_qty",
                search_field_uom: "uom_id",
            };
        },

        /**
         * @private
         * @returns {Object}
         */
        _getQWebContext: function() {
            // Using directly the 'model record' instead of the state because
            // the state it's a parsed version of this record that doesn't
            // contains the '_virtual' attribute.
            const model = this.options.basicFieldParams.model;
            const record = model.get(this.state.id);
            return {
                record_search: this.recordSearch,
                user_context:
                    (this.getSession() && this.getSession().user_context) || {},
                image: this._getImageUrl.bind(this),
                compute_domain: this._computeDomain.bind(this),
                state: this.state,
                field_map: this.options.fieldMap,
                widget: this,
                monetary: this._getMonetaryFieldValue.bind(this),
                floatFixed: this._getFloatFieldValue.bind(this),
                show_discount: this.options.showDiscount,
                is_virtual: this.is_virtual,
                modified:
                    record &&
                    model.hasChanges(record.id) &&
                    !model.isPureVirtual(record.id),
                active_model: "",
                auto_save: this.options.autoSave,
                is_saving: record && record.context.saving,
                lazy_qty: record && record.context.lazy_qty,
                has_onchange: record && !record.context.not_onchange,
                field_uom: this.master_uom_map.field_uom,
                field_uom_qty: this.master_uom_map.field_uom_qty,
            };
        },

        /**
         * Forced context used in virtual states
         *
         * @private
         * @returns {Object}
         */
        _getInternalVirtualRecordContext: function() {
            const context = {};
            context[`default_${this.options.basicFieldParams.relation_field}`] =
                this.options.basicFieldParams.record.id || null;
            context[`default_${this.options.fieldMap.product}`] =
                this.recordSearch.id || null;
            context[`default_${this.master_uom_map.field_uom_qty}`] = 1.0;
            return context;
        },

        /**
         * Forced data used in virtual states.
         * Be careful with the onchanges sequence. Think as user interaction ("ADD", "DELETE", ... commands), not as CRUD operation.
         *
         * @private
         * @returns {Object}
         */
        _getInternalVirtualRecordData: function() {
            // To be overwritten
            return {};
        },

        /**
         * This generates a virtual record with delayed call to "get_default" & "onchange"
         * used in "instant search" mode
         *
         * @private
         * @param {Object} context
         * @param {Object} def_values
         * @returns {Promise}
         */
        _generateVirtualStateSimple: function(context, def_values) {
            const model = this.options.basicFieldParams.model;
            return new Promise(resolve => {
                const record_def = model.createVirtualDatapoint(
                    this.options.basicFieldParams.value.id,
                    {
                        context: context,
                    }
                );
                model.applyDefaultValues(record_def.record.id, def_values).then(() => {
                    const new_state = model.get(record_def.record.id);
                    const product_uom_id =
                        new_state.data[
                            this.options.fieldMap[this.master_uom_map.field_uom]
                        ].id;
                    // Apply default values
                    model
                        .applyDefaultValues(
                            product_uom_id,
                            {
                                display_name: this.recordSearch[
                                    this.master_uom_map.search_field_uom
                                ][1],
                            },
                            {
                                fieldNames: ["display_name"],
                            }
                        )
                        .then(() => {
                            return model._fetchRelationalData(record_def.record);
                        })
                        .then(() => {
                            return model._postprocess(record_def.record);
                        })
                        .then(() => {
                            this._timerOnChange = setTimeout(
                                (current_batch_id, record_def) => {
                                    this._timerOnChange = false;
                                    if (
                                        current_batch_id !==
                                            this.options.basicFieldParams
                                                .current_batch_id ||
                                        record_def.record.context.aborted
                                    ) {
                                        return;
                                    }
                                    model
                                        ._makeDefaultRecordNoDatapoint(
                                            record_def.record,
                                            record_def.params
                                        )
                                        .then(() => {
                                            if (record_def.record.context.aborted) {
                                                return;
                                            }
                                            model.updateRecordContext(
                                                record_def.record.id,
                                                {
                                                    not_onchange: false,
                                                }
                                            );
                                            this.recreate(
                                                model.get(record_def.record.id)
                                            );
                                        });
                                },
                                this._onchange_delay,
                                this.options.basicFieldParams.current_batch_id,
                                record_def
                            );

                            resolve(model.get(record_def.record.id));
                        });
                });
            });
        },

        /**
         * Generates a complete virtual record
         *
         * @private
         * @param {Object} data
         * @param {Object} context
         * @param {Object} def_values
         * @returns {Promise}
         */
        _generateVirtualStateFull: function(data, context, def_values) {
            const model = this.options.basicFieldParams.model;
            return new Promise(resolve => {
                model
                    .createVirtualRecord(this.options.basicFieldParams.value.id, {
                        context: context,
                    })
                    .then(result => {
                        // Apply default values
                        model
                            .applyDefaultValues(result.record.id, def_values)
                            .then(() => {
                                const new_state = model.get(result.record.id);
                                const product_uom_id =
                                    new_state.data[
                                        this.options.fieldMap[
                                            this.master_uom_map.field_uom
                                        ]
                                    ].id;
                                model
                                    .applyDefaultValues(
                                        product_uom_id,
                                        {
                                            display_name: this.recordSearch[
                                                this.master_uom_map.search_field_uom
                                            ][1],
                                        },
                                        {
                                            fieldNames: ["display_name"],
                                        }
                                    )
                                    .then(() => {
                                        const sdata = _.extend(
                                            {},
                                            this._getInternalVirtualRecordData(),
                                            data
                                        );
                                        this._applyChanges(
                                            result.record.id,
                                            sdata,
                                            result.params
                                        ).then(() =>
                                            resolve(model.get(result.record.id))
                                        );
                                    });
                            });
                    });
            });
        },

        /**
         * @private
         * @param {Object} data
         * @param {Object} context
         * @param {Boolean} simple_mode
         * @returns {Object}
         */
        _generateVirtualState: function(data, context, simple_mode) {
            const scontext = _.extend(
                {},
                this._getInternalVirtualRecordContext(),
                context
            );
            // Apply default values
            const def_values = {
                [this.options.fieldMap.product]: this.recordSearch.id,
                [this.options.fieldMap[this.master_uom_map.field_uom_qty]]: 1.0,
                [this.options.fieldMap[this.master_uom_map.field_uom]]: this
                    .recordSearch[this.master_uom_map.search_field_uom][0],
            };
            if (simple_mode) {
                return this._generateVirtualStateSimple(scontext, def_values);
            }
            return this._generateVirtualStateFull(data, scontext, def_values);
        },

        /**
         * Apply changes (with onchange)
         *
         * @param {Integer/String} record_id
         * @param {Object} changes
         * @param {Object} options
         * @returns {Promise}
         */
        _applyChanges: function(record_id, changes, options) {
            const model = this.options.basicFieldParams.model;
            return model._applyChange(record_id, changes, options).then(() => {
                model.updateRecordContext(record_id, {
                    not_onchange: false,
                });
                this.recreate(model.get(record_id));
            });
        },

        /**
         * @private
         */
        _detachAllWidgets: function() {
            _.invoke(this.widgets.front, "on_detach_callback");
            _.invoke(this.widgets.back, "on_detach_callback");
            this.widgets = {
                front: [],
                back: [],
            };
        },

        /**
         * @override
         */
        _render: function() {
            this._detachAllWidgets();
            this.defs = [];
            this._replaceElement(
                qweb.render("One2ManyProductPicker.FlipCard", this._getQWebContext())
            );
            this.$el.data("renderer_widget_index", this.options.renderer_widget_index);
            this.$card = this.$(".oe_flip_card");
            this.$front = this.$(".oe_flip_card_front");
            this.$back = this.$(".oe_flip_card_back");
            this._processWidgetFields(this.$front);
            this._processWidgets(this.$front, "front");
            this._processDynamicFields();
            return $.when.apply(this, this.defs);
        },

        /**
         * Processes each 'field' tag and replaces it by the specified widget, if
         * any, or directly by the formatted value
         *
         * @private
         * @param {jQueryElement} $container
         */
        _processWidgetFields: function($container) {
            $container.find("field").each((key, value) => {
                const $field = $(value);
                if ($field.parents("widget").length) {
                    return;
                }
                const field_name = $field.attr("name");
                const field_widget = $field.attr("widget");

                // A widget is specified for that field or a field is a many2many ;
                // in this latest case, we want to display the widget many2manytags
                // even if it is not specified in the view.
                if (field_widget || this.fields[field_name].type === "many2many") {
                    let widget = this.subWidgets[field_name];
                    if (widget) {
                        // A widget already exists for that field, so reset it
                        // with the new state
                        widget.reset(this.state);
                        $field.replaceWith(widget.$el);
                    } else {
                        // The widget doesn't exist yet, so instanciate it
                        const Widget = this.fieldsInfo[field_name].Widget;
                        if (Widget) {
                            widget = this._processWidget($field, field_name, Widget);
                            this.subWidgets[field_name] = widget;
                        } else if (config.isDebug()) {
                            // The widget is not implemented
                            $field.replaceWith(
                                $("<span>", {
                                    text: _.str.sprintf(
                                        _t("[No widget %s]"),
                                        field_widget
                                    ),
                                })
                            );
                        }
                    }
                }
            });
        },

        /**
         * Replace a field by its corresponding widget.
         *
         * @private
         * @param {JQuery} $field
         * @param {String} field_name
         * @param {Class} Widget
         * @returns {Widget} the widget instance
         */
        _processWidget: function($field, field_name, Widget) {
            // Some field's attrs might be record dependent (they start with
            // 't-att-') and should thus be evaluated, which is done by qweb
            // we here replace those attrs in the dict of attrs of the state
            // by their evaluted value, to make it transparent from the
            // field's widgets point of view
            // that dict being shared between records, we don't modify it
            // in place
            const attrs = Object.create(null);
            _.each(this.fieldsInfo[field_name], (value, key) => {
                if (_.str.startsWith(key, "t-att-")) {
                    key = key.slice(6);
                    value = $field.attr(key);
                }
                attrs[key] = value;
            });
            const options = _.extend({}, this.options, {
                attrs: attrs,
                data: this.state.data,
            });
            const widget = new Widget(
                this,
                field_name,
                this.getParent().state,
                options
            );
            const def = widget.replace($field);
            this.defs.push(def);
            return widget;
        },

        /**
         * Initialize widgets using "widget" tag
         *
         * @private
         * @param {jQueryElement} $container
         * @param {String} widget_zone
         */
        _processWidgets: function($container, widget_zone) {
            $container.find("widget").each((key, value) => {
                const $field = $(value);
                const FieldWidget = widgetRegistry.get($field.attr("name"));
                const widget = new FieldWidget(this, {
                    fieldsInfo: this.fieldsInfo,
                    fields: this.fields,
                    main_state: this.getParent().state,
                    state: this.state,
                    fieldMap: this.options.fieldMap,
                    searchRecord: this.recordSearch,
                    node: $field,
                    readonly: this.options.readOnlyMode,
                    basicFieldParams: this.options.basicFieldParams,
                    data: this.state && this.state.data,
                });

                this.widgets[widget_zone].push(widget);

                const def = widget
                    ._widgetRenderAndInsert(() => {
                        // Do nothing
                    })
                    .then(() => {
                        widget.$el.addClass("o_widget");
                        $field.replaceWith(widget.$el);
                    });
                this.defs.push(def);
            });
        },

        /**
         * @private
         */
        _updateLazyQty: function() {
            var model = this.options.basicFieldParams.model;
            var record = model.get(this.state.id);
            this.$el.find(".lazy_product_qty").text(record.context.lazy_qty);
        },

        /**
         * This is a special handle for display the non-fields.
         * Similar 't-esc' behaviour.
         * A non-field element has defined the "data-field" paramenter with
         * the field that trigger the update. Also this non-field element has
         * the attribute "format" to use with "py.eval".
         * Note that the context used in py.eval has all record fields data.
         *
         * Exmaple:
         * <span data-field="qty" data-esc="str(qty) + ' Items'"/>
         * ** This will change the elements when 'qty' changes and prints the
         * text: 20 Items
         *
         * @private
         * @param {Array} fields
         */
        _processDynamicFields: function(fields) {
            if (!this.state) {
                return;
            }
            const model = this.options.basicFieldParams.model;
            const record = model.get(this.state.id);
            const state_data = record.data;

            let to_find = [];
            if (_.isEmpty(fields)) {
                to_find = ["[data-field]"];
            } else {
                to_find = _.map(fields, field => {
                    return _.str.sprintf("[data-field=%s]", [field]);
                });
            }

            this.$el.find(to_find.join()).each((key, value) => {
                const $elm = $(value);
                const format_out = $elm.data("esc") || $elm.data("field");
                const text_out = py.eval(
                    format_out,
                    _.extend({}, state_data, this.recordSearch)
                );
                $elm.html(text_out);
                $elm.attr("title", text_out);
            });

            if (this.options.showDiscount) {
                const field_map = this.options.fieldMap;
                if (state_data) {
                    const has_discount = state_data[field_map.discount] !== 0.0;
                    this.$el
                        .find(".original_price,.discount_price")
                        .toggleClass("d-none", !has_discount);
                    if (has_discount) {
                        this.$el.find(".price_unit").html(this._calcPriceReduced());
                    } else {
                        this.$el
                            .find(".price_unit")
                            .html(this._getMonetaryFieldValue("price_unit"));
                    }
                }
            }
        },

        /**
         * @private
         * @returns {String}
         */
        _calcPriceReduced: function() {
            let price_reduce = 0;
            const field_map = this.options.fieldMap;
            const model = this.options.basicFieldParams.model;
            const record = model.get(this.state.id);
            if (record && record.data[field_map.discount]) {
                price_reduce = tools.priceReduce(
                    record.data[field_map.price_unit],
                    record.data[field_map.discount]
                );
            }
            return (
                price_reduce &&
                tools.monetary(
                    price_reduce,
                    this.state.fields[field_map.price_unit],
                    this.options.currencyField,
                    this.options.basicFieldParams.record.data
                )
            );
        },

        /**
         * @private
         * @returns {Promise}
         */
        _saveRecord: function() {
            const model = this.options.basicFieldParams.model;
            const record = model.get(this.state.id);
            model.updateRecordContext(this.state.id, {saving: true});
            this.recreate();
            return model
                .save(record.id, {
                    stayInEdit: true,
                    reload: true,
                    savePoint: true,
                    viewType: "form",
                })
                .then(() => {
                    const record = model.get(this.state.id);
                    this.trigger_up("create_quick_record", {
                        id: record.id,
                        callback: () => {
                            model.updateRecordContext(this.state.id, {saving: false});
                            this.$card
                                .find(".o_catch_attention")
                                .removeClass("o_catch_attention");
                        },
                    });
                    model.unsetDirty(this.state.id);
                });
        },

        /**
         * @private
         */
        _updateRecord: function() {
            const model = this.options.basicFieldParams.model;
            const record = model.get(this.state.id);
            this.trigger_up("update_quick_record", {
                id: record.id,
                callback: () => {
                    this.$card
                        .find(".o_catch_attention")
                        .removeClass("o_catch_attention");
                },
            });
            model.unsetDirty(this.state.id);
        },

        /**
         * @private
         * @returns {Promise}
         */
        _addProduct: function() {
            const model = this.options.basicFieldParams.model;
            model.updateRecordContext(this.state.id, {
                ignore_warning: this.options.ignoreWarning,
            });
            const record = model.get(this.state.id);
            // Because we don't hide the 'add' button when the product is added form back form
            // we check if the record is in "saving" mode to prevent duplicate it.
            if (record.context.saving) {
                return Promise.resolve();
            }
            const changes = _.pick(
                record.data,
                this.options.fieldMap[this.master_uom_map.field_uom_qty]
            );
            if (
                changes[this.options.fieldMap[this.master_uom_map.field_uom_qty]] === 0
            ) {
                changes[this.options.fieldMap[this.master_uom_map.field_uom_qty]] = 1;
            }
            this.$card.addClass("blocked");
            return model.notifyChanges(record.id, changes).then(() => {
                this._saveRecord();
            });
        },

        /**
         * @private
         * @param {Number} amount
         * @returns {Promise}
         */
        _incProductQty: function(amount) {
            const model = this.options.basicFieldParams.model;
            model.updateRecordContext(this.state.id, {
                ignore_warning: this.options.ignoreWarning,
            });
            const record = model.get(this.state.id);
            if (this.options.autoSave && !this.state.data.id) {
                let lazy_qty = record.context.lazy_qty || 1;
                lazy_qty += amount;
                model.updateRecordContext(this.state.id, {lazy_qty: lazy_qty});
                this._updateLazyQty();
            } else {
                // HACK: Modify the raw state value to show correct 'qty' when
                // receive the response from Odoo. This happens because the widget
                // sends a creation with qty 1 but can still add more qty mean while
                // wait for the Odoo response.
                const model_record_data = model.localData[this.state.id].data;
                if (
                    _.isNull(
                        model_record_data[
                            this.options.fieldMap[this.master_uom_map.field_uom_qty]
                        ]
                    )
                ) {
                    model_record_data[
                        this.options.fieldMap[this.master_uom_map.field_uom_qty]
                    ] = 1;
                }
                model_record_data[
                    this.options.fieldMap[this.master_uom_map.field_uom_qty]
                ] += amount;
                return model
                    .notifyChanges(record.id, {
                        [this.options.fieldMap[this.master_uom_map.field_uom_qty]]:
                            model_record_data[
                                this.options.fieldMap[this.master_uom_map.field_uom_qty]
                            ],
                    })
                    .then(() => {
                        this._processDynamicFields();
                        this._lazyUpdateRecord();
                    });
            }
        },

        /**
         * @private
         * @param {Selector/HTMLElement} target
         */
        _doInteractAnim: function(target) {
            const $target = $(target);
            $target.addClass("o_catch_attention");
        },

        /**
         * @private
         */
        _openPriceModifier: function() {
            const state_data = this.state && this.state.data;
            if (this.options.readOnlyMode || !state_data) {
                return;
            }

            const modif_price_form = new ProductPickerQuickModifPriceForm(this, {
                fieldsInfo: this.fieldsInfo,
                fields: this.fields,
                main_state: this.getParent().state,
                state: this.state,
                fieldMap: this.options.fieldMap,
                searchRecord: this.recordSearch,
                readonly: this.options.readOnlyMode,
                basicFieldParams: this.options.basicFieldParams,
                canEditPrice: this.options.editPrice,
                canEditDiscount: this.options.editDiscount,
                currencyField: this.options.currencyField,
            });
            this.$modifPriceModal = $(
                qweb.render("One2ManyProductPicker.QuickModifPrice.Modal")
            );
            this.$modifPriceModal.appendTo($(".oe_one2many_product_picker_view"));
            modif_price_form.attachTo(this.$modifPriceModal);
            this.$modifPriceModal.modal();
        },

        // HANDLE EVENTS

        /**
         * @private
         * @param {ClickEvent} evt
         */
        _onClickFlipCard: function(evt) {
            // Avoid clicks on form elements
            if (["INPUT", "BUTTON", "A"].indexOf(evt.target.tagName) !== -1) {
                return;
            }
            const $target = $(evt.target);
            if (!this.options.readOnlyMode) {
                if (
                    $target.hasClass("add_product") ||
                    $target.parents(".add_product").length
                ) {
                    if (!this.is_adding_product) {
                        this.is_adding_product = true;
                        this._addProduct();
                        this._doInteractAnim(evt.target);
                    }
                    return;
                } else if (
                    $target.hasClass("product_qty") ||
                    $target.parents(".product_qty").length
                ) {
                    this._incProductQty(1);
                    this._doInteractAnim(evt.target);
                    return;
                } else if ($target.hasClass("safezone")) {
                    // Do nothing on safe zones
                    return;
                }
            }

            if (this.$card.hasClass("blocked")) {
                return;
            }

            if (!this._clickFlipCardDelayed) {
                this._clickFlipCardDelayed = setTimeout(
                    this._onClickDelayedFlipCard.bind(this, evt),
                    this._click_card_delayed_time
                );
            }
            ++this._clickFlipCardCount;
            if (this._clickFlipCardCount >= 2) {
                clearTimeout(this._clickFlipCardDelayed);
                this._clickFlipCardDelayed = false;
                this._clickFlipCardCount = 0;
                this._onDblClickDelayedFlipCard(evt);
            }
        },

        /**
         * @private
         */
        _onClickDelayedFlipCard: function() {
            this._clickFlipCardDelayed = false;
            this._clickFlipCardCount = 0;

            if (this.options.readOnlyMode || !this.state) {
                return;
            }
            if (this.$card.hasClass("active")) {
                this.$card.removeClass("active");
                this.$front.removeClass("d-none");
            } else {
                this.defs = [];
                if (!this.widgets.back.length) {
                    this._processWidgetFields(this.$back);
                    this._processWidgets(this.$back, "back");
                }
                this._processDynamicFields();
                $.when(this.defs).then(() => {
                    const $actived_card = this.$el.parent().find(".active");
                    $actived_card.removeClass("active");
                    $actived_card.find(".oe_flip_card_front").removeClass("d-none");
                    this.$card.addClass("active");
                    this.$card.on("transitionend", () => {
                        this.$front.addClass("d-none");
                        this.$card.off("transitionend");
                    });
                    this.trigger_up("record_flip", {
                        widget_index: this.$el.data("renderer_widget_index"),
                        prev_widget_index: $actived_card
                            .parent()
                            .data("renderer_widget_index"),
                    });
                });
            }
        },

        /**
         * @private
         * @param {MouseEvent} evt
         */
        _onDblClickDelayedFlipCard: function(evt) {
            const $target = $(evt.target);
            if (
                $target.hasClass("badge_price") ||
                $target.parents(".badge_price").length
            ) {
                this._openPriceModifier();
            } else {
                const $currentTarget = $(evt.currentTarget);
                const $img = $currentTarget.find(".oe_flip_card_front img");
                const cur_img_src = $img.attr("src");
                if ($currentTarget.hasClass("oe_flip_card_maximized")) {
                    $currentTarget.removeClass("oe_flip_card_maximized");
                    $currentTarget.on("transitionend", function() {
                        $currentTarget.css({
                            position: "",
                            top: "",
                            left: "",
                            width: "",
                            height: "",
                            zIndex: "",
                        });
                        $currentTarget.off("transitionend");
                    });
                } else {
                    const $actived_card = this.$el.parent().find(".active");
                    if ($actived_card[0] !== $currentTarget[0]) {
                        $actived_card.removeClass("active");
                        $actived_card.find(".oe_flip_card_front").removeClass("d-none");
                    }
                    const offset = $currentTarget.offset();
                    $currentTarget.css({
                        position: "fixed",
                        top: offset.top,
                        left: offset.left,
                        width: $currentTarget.width(),
                        height: $currentTarget.height(),
                        zIndex: 50,
                    });
                    _.defer(function() {
                        $currentTarget.addClass("oe_flip_card_maximized");
                    });
                }
                $img.attr("src", $img.data("srcAlt"));
                $img.data("srcAlt", cur_img_src);
            }
        },

        /**
         * @private
         * @param {CustomEvent} evt
         */
        _onRestoreFlipCard: function(evt) {
            this.$card.removeClass("active");
            this.$front.removeClass("d-none");
            const $img = this.$front.find("img");
            const cur_img_src = $img.attr("src");
            if (this.$card.hasClass("oe_flip_card_maximized")) {
                this.$card.removeClass("oe_flip_card_maximized");
                this.$card.on("transitionend", () => {
                    this.$card.css({
                        position: "",
                        top: "",
                        left: "",
                        width: "",
                        height: "",
                        zIndex: "",
                    });
                    this.$card.off("transitionend");
                    if (evt.data.success_callback) {
                        evt.data.success_callback();
                    }
                });
            } else if (evt.data.success_callback) {
                evt.data.success_callback();
            }

            if (evt.data.block) {
                this.$card.addClass("blocked");
            }
            $img.attr("src", $img.data("srcAlt"));
            $img.data("srcAlt", cur_img_src);
        },

        /**
         * Update the selected element using the given format.
         * A non-field element has defined the "data-field" paramenter with
         * the field that trigger the update. Also this non-field element has
         * the attribute "format" to use with "py.eval".
         * Note that the context used in py.eval has all record fields data.
         *
         * Exmaple:
         * <span data-field="qty" data-esc="str(qty) + ' Items'"/>
         * ** This will change the elements when 'qty' changes and prints the
         * text: 20 Items
         *
         * @private
         * @param {CustomEvent} evt
         */
        _onQuickRecordUpdated: function(evt) {
            this._processDynamicFields(Object.keys(evt.data.changes));
            // This.recreate();
            this.trigger_up("update_subtotal");
        },
    });

    return One2ManyProductPickerRecord;
});
