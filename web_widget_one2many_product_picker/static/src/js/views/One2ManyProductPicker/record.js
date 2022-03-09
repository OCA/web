/* global py */
// Copyright 2020 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define("web_widget_one2many_product_picker.One2ManyProductPickerRecord", function(
    require
) {
    "use strict";

    var core = require("web.core");
    var Widget = require("web.Widget");
    var Domain = require("web.Domain");
    var widgetRegistry = require("web.widget_registry");
    var tools = require("web_widget_one2many_product_picker.tools");
    var config = require("web.config");

    var qweb = core.qweb;
    var _t = core._t;

    /* This represent a record (a card) */
    var One2ManyProductPickerRecord = Widget.extend({
        custom_events: {
            quick_record_updated: "_onQuickRecordUpdated",
            restore_flip_card: "_onRestoreFlipCard",
            block_card: "_onBlockCard",
            back_form_loaded: "_onBackFormLoaded",
        },
        events: {
            "click .oe_flip_card": "_onClickFlipCard",
        },

        _click_card_delayed_time: 250,
        _trigger_record_action_delay: 600,

        /**
         * @override
         */
        init: function(parent, state, options) {
            this._super(parent);
            this.options = options;
            this.subWidgets = {};
            this._clickFlipCardCount = 0;
            this._setMasterUomMap();
            this._setState(state, options.searchRecord);
            this.widgets = {
                front: [],
                back: [],
            };
            this._lazyUpdateRecord = _.debounce(
                this._updateRecord.bind(this),
                this._trigger_record_action_delay
            );
            this._lazyAddProduct = _.debounce(
                this._addProduct.bind(this),
                this._trigger_record_action_delay
            );
        },

        /**
         * Generates a new virtual state and recreates the product card
         *
         * @param {Boolean} simple_mode
         * @returns {Object}
         */
        generateVirtualState: function(options) {
            return this._generateVirtualState(undefined, undefined, options).then(
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
                var model = this.options.basicFieldParams.model;
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
         * @returns {Deferred}
         */
        recreate: function(state) {
            if (!this.getParent()) {
                // It's a zombie record! ensure kill it!
                this.destroy();
                return $.when();
            }

            if (state) {
                this._setState(state);
            } else {
                var model = this.options.basicFieldParams.model;
                this.is_virtual = !this.state || model.isPureVirtual(this.state.id);
            }

            if (this.$card && this.$card.length) {
                this.$card.removeClass("blocked");
                // Avoid recreate active record
                if (this.$card.hasClass("active")) {
                    this.$front.replaceWith(
                        qweb.render(
                            "One2ManyProductPicker.FlipCard.Front",
                            this._getQWebContext()
                        )
                    );
                    this._processWidgetFields(this.$front);
                    this._processWidgets(this.$front, "front");
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
            var model = this.options.basicFieldParams.model;
            var field_name = this.options.fieldMap[price_field];
            var record = model.get(this.state.id);
            var price = record.data[field_name];
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
        _getFloatFieldValue: function(field, value) {
            var model = this.options.basicFieldParams.model;
            var field_name = this.options.fieldMap[field];
            var record = model.get(this.state.id);
            if (typeof value === "undefined") {
                value = record.data[field_name];
            }
            return tools.float(value, record.fields[field_name]);
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
            var model = this.options.basicFieldParams.model;
            if (this.state && (!viewState || this.state.id !== viewState.id)) {
                model.removeVirtualRecord(this.state.id);
            }
            this.state = viewState;
            this._setMasterUomMap();

            if (recordSearch) {
                this.recordSearch = recordSearch;
            }
            this.is_virtual = !this.state || model.isPureVirtual(this.state.id);

            // Check if has cached qty. if not, set the actual qty.
            if (this.state) {
                var record = model.get(this.state.id);
                var new_context = {
                    ignore_warning: this.options.ignoreWarning,
                    shadow: true,
                    saving: (record && record.context.saving) || false,
                    need_notify: (record && record.context.need_notify) || false,
                    need_save: (record && record.context.need_save) || false,
                };
                var lazy_qty = (record && record.context.lazy_qty) || 0;
                if (this.is_virtual) {
                    // Pure virtual records uses 1 qty to trigger the onchanges
                    // but really the qty its zero.
                    new_context.lazy_qty = lazy_qty;
                } else {
                    // For non pure virtual records the default "lazy_qty"
                    // must be the actual qty in the line
                    new_context.lazy_qty =
                        lazy_qty ||
                        record.data[
                            this.options.fieldMap[this.master_uom_map.field_uom_qty]
                        ];
                }
                model.updateRecordContext(this.state.id, new_context);
            }
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
            var model = this.options.basicFieldParams.model;
            var record = model.get(this.state.id);
            return {
                record_search: this.recordSearch,
                user_context:
                    (this.getSession() && this.getSession().user_context) || {},
                image: this._getImageUrl.bind(this),
                compute_domain: this._computeDomain.bind(this),
                state: model.get(this.state.id),
                field_map: this.options.fieldMap,
                widget: this,
                monetary: this._getMonetaryFieldValue.bind(this),
                floatFixed: this._getFloatFieldValue.bind(this),
                show_discount: this.options.showDiscount,
                is_virtual: this.is_virtual,
                active_model: "",
                auto_save: this.options.autoSave,
                is_saving: record && record.context.saving,
                modified: record && record.context.modified,
                need_notify: record && record.context.need_notify,
                need_save: record && record.context.need_save,
                lazy_qty:
                    record &&
                    this._getFloatFieldValue(
                        this.options.fieldMap[this.master_uom_map.field_uom_qty],
                        record.context.lazy_qty !== 0
                            ? record.context.lazy_qty
                            : undefined
                    ),
                has_onchange: record && !record.context.not_onchange,
                field_uom: this.master_uom_map.field_uom,
                field_uom_qty: this.master_uom_map.field_uom_qty,
            };
        },

        /**
         * @private
         * @returns {Object}
         */
        _getEvalContext: function() {
            var model = this.options.basicFieldParams.model;
            var record = model.get(this.state.id);
            var PY_monetary = new py.PY_def.fromJSON(
                function() {
                    var args = py.PY_parseArgs(arguments, ["str"]);
                    return py.str.fromJSON(
                        this._getMonetaryFieldValue(args.str.toJSON())
                    );
                }.bind(this)
            );
            var PY_floatFixed = new py.PY_def.fromJSON(
                function() {
                    var args = py.PY_parseArgs(arguments, ["str"]);
                    return py.str.fromJSON(this._getFloatFieldValue(args.str.toJSON()));
                }.bind(this)
            );
            return {
                obj: _.extend({}, record.data, this.recordSearch),
                monetary: PY_monetary,
                floatFixed: PY_floatFixed,
            };
        },

        /**
         * Forced context used in virtual states
         *
         * @private
         * @returns {Object}
         */
        _getInternalVirtualRecordContext: function() {
            var context = {};
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
         * The method is only needed for records that are 'pure virtual'
         *
         * @private
         * @param {Object} context
         * @param {Object} def_values
         * @returns {Deferred}
         */
        _generateVirtualStateDeferred: function(context, def_values, options) {
            var self = this;
            var model = this.options.basicFieldParams.model;
            var def = $.Deferred();
            var record_def = model.createVirtualDatapoint(
                this.options.basicFieldParams.value.id,
                {
                    context: context,
                }
            );
            model
                .applyDefaultValues(record_def.record.id, def_values)
                .then(function() {
                    return model._fetchRelationalData(record_def.record);
                })
                .then(function() {
                    return model._postprocess(record_def.record);
                })
                .then(function() {
                    // self._timerOnChange = setTimeout(
                    //     function(current_batch_id, record_def) {
                    //         self._timerOnChange = false;
                    //         if (
                    //             current_batch_id !==
                    //                 self.options.basicFieldParams.current_batch_id ||
                    //             record_def.record.context.aborted
                    //         ) {
                    //             return;
                    //         }
                            return model
                                ._makeDefaultRecordNoDatapoint(
                                    record_def.record,
                                    record_def.params
                                )
                                .then(function() {
                                    if (record_def.record.context.aborted) {
                                        return;
                                    }
                                    model.updateRecordContext(record_def.record.id, {
                                        not_onchange: false,
                                    });

                                    return self.recreate(
                                        model.get(record_def.record.id)
                                    )
                                    // .then(function() {
                                    //     var field_uom_qty = self.options.fieldMap[
                                    //         self.master_uom_map.field_uom_qty
                                    //     ];
                                    //     var record_state = model.get(record_def.record.id);
                                    //     // Check if need update the qty
                                    //     if (
                                    //         record_state.context.lazy_qty > 0
                                    //     ) {
                                    //         var model_record =
                                    //             model.localData[record_def.record.id];
                                    //         model_record._changes =
                                    //             model_record._changes || {};
                                    //         model_record._changes[field_uom_qty] =
                                    //             record_state.context.lazy_qty;
                                    //         return self._modifyProductDelayed(0, 'add');
                                    //     }
                                    // });
                                });
                    //     },
                    //     options.onchange_delay,
                    //     self.options.basicFieldParams.current_batch_id,
                    //     record_def
                    // );

                    return def.resolve(model.get(record_def.record.id));
                });
            return def;
        },

        /**
         * @private
         * @param {Object} data
         * @param {Object} context
         * @param {Boolean} simple_mode
         * @returns {Object}
         */
        _generateVirtualState: function(data, context, options) {
            var scontext = _.extend(
                {},
                this._getInternalVirtualRecordContext(),
                context
            );
            // Apply default values
            var def_values = {
                [this.options.fieldMap.product]: this.recordSearch.id,
                [this.options.fieldMap[this.master_uom_map.field_uom_qty]]: 1.0,
                [this.options.fieldMap[this.master_uom_map.field_uom]]: this
                    .recordSearch[this.master_uom_map.search_field_uom][0],
            };
            return this._generateVirtualStateDeferred(scontext, def_values, options);
        },

        /**
         * Apply changes (with onchange)
         *
         * @param {Integer/String} record_id
         * @param {Object} changes
         * @param {Object} options
         * @returns {Deferred}
         */
        _applyChanges: function(record_id, changes, options) {
            var self = this;
            var model = this.options.basicFieldParams.model;
            return model._applyChange(record_id, changes, options).then(function() {
                model.updateRecordContext(record_id, {
                    not_onchange: false,
                });
                self.recreate(model.get(record_id));
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
            var self = this;
            $container.find("field").each(function(key, value) {
                var $field = $(value);
                if ($field.parents("widget").length) {
                    return;
                }
                var field_name = $field.attr("name");
                var field_widget = $field.attr("widget");

                // A widget is specified for that field or a field is a many2many ;
                // in this latest case, we want to display the widget many2manytags
                // even if it is not specified in the view.
                if (field_widget || self.fields[field_name].type === "many2many") {
                    var widget = self.subWidgets[field_name];
                    if (widget) {
                        // A widget already exists for that field, so reset it
                        // with the new state
                        widget.reset(self.state);
                        $field.replaceWith(widget.$el);
                    } else {
                        // The widget doesn't exist yet, so instanciate it
                        var Widget = self.fieldsInfo[field_name].Widget;
                        if (Widget) {
                            widget = self._processWidget($field, field_name, Widget);
                            self.subWidgets[field_name] = widget;
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
            var attrs = Object.create(null);
            _.each(this.fieldsInfo[field_name], function(value, key) {
                if (_.str.startsWith(key, "t-att-")) {
                    key = key.slice(6);
                    value = $field.attr(key);
                }
                attrs[key] = value;
            });
            var options = _.extend({}, this.options, {
                attrs: attrs,
                data: this.state.data,
            });
            var widget = new Widget(this, field_name, this.getParent().state, options);
            var def = widget.replace($field);
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
            var self = this;
            $container.find("widget").each(function(key, value) {
                var $field = $(value);
                var FieldWidget = widgetRegistry.get($field.attr("name"));
                var widget = new FieldWidget(self, {
                    fieldsInfo: self.fieldsInfo,
                    fields: self.fields,
                    main_state: self.getParent().state,
                    state: self.state,
                    fieldMap: self.options.fieldMap,
                    searchRecord: self.recordSearch,
                    node: $field,
                    readonly: self.options.readOnlyMode,
                    basicFieldParams: self.options.basicFieldParams,
                    data: self.state && self.state.data,
                });

                self.widgets[widget_zone].push(widget);

                var def = widget
                    ._widgetRenderAndInsert(function() {
                        // Do nothing
                    })
                    .then(function() {
                        widget.$el.addClass("o_widget");
                        $field.replaceWith(widget.$el);
                    });
                self.defs.push(def);
            });
        },

        /**
         * @param {Object} options
         */
        highlight: function(options) {
            options = options || {};
            this._doInteractAnim();
            this.$front.removeClass("border-sucess").addClass("border-warning");
            if (options.qty) {
                this.$el
                    .find(".badge.product_qty,.badge.add_product")
                    .removeClass("badge-primary")
                    .addClass("badge-warning");
            }
            if (options.price) {
                this.$el
                    .find(".badge.price_unit")
                    .removeClass("badge-info")
                    .addClass("badge-warning");
            }
        },

        /**
         * @private
         */
        _updateLazyQty: function() {
            var model = this.options.basicFieldParams.model;
            var record = model.get(this.state.id);
            this.highlight({qty: true});
            this.$el
                .find(".lazy_product_qty")
                .text(
                    this._getFloatFieldValue(
                        this.options.fieldMap[this.master_uom_map.field_uom_qty],
                        record.context.lazy_qty
                    )
                );
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
            if (!this.state || !this.$el || !this.$el.length) {
                return;
            }
            var model = this.options.basicFieldParams.model;
            var record = model.get(this.state.id);
            var state_data = record.data;
            var context = this._getEvalContext();
            var to_find = [];
            if (_.isEmpty(fields)) {
                to_find = ["[data-field]"];
            } else {
                to_find = _.map(fields, function(field) {
                    return `[data-field=${field}]`;
                });
            }

            this.$el.find(to_find.join()).each(function(key, value) {
                var $elm = $(value);
                var format_out = $elm.data("esc") || $elm.data("field");
                var text_out = py.eval(format_out, context);
                $elm.html(text_out);
                $elm.attr("title", text_out);
            });

            if (this.options.showDiscount) {
                var field_map = this.options.fieldMap;
                if (state_data) {
                    var has_discount = state_data[field_map.discount] !== 0.0;
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
            } else {
                this.$el
                    .find(".price_unit")
                    .html(this._getMonetaryFieldValue("price_unit"));
            }
        },

        /**
         * @private
         * @returns {String}
         */
        _calcPriceReduced: function() {
            var price_reduce = 0;
            var field_map = this.options.fieldMap;
            var model = this.options.basicFieldParams.model;
            var record = model.get(this.state.id);
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
         * @returns {Deferred}
         */
        _saveRecord: function() {
            var model = this.options.basicFieldParams.model;
            var record = model.get(this.state.id);
            if (!record) {
                return $.Deferred().resolve();
            }
            return model.save(record.id, {
                stayInEdit: true,
                reload: true,
                savePoint: true,
                viewType: "form",
            });
        },

        /**
         * @private
         */
        _updateRecord: function(amount) {
            var self = this;
            var model = this.options.basicFieldParams.model;
            var record = model.get(this.state.id);
            // Because we don't hide the 'add' button when the product is added form back form
            // we check if the record is in "saving" mode to prevent duplicate it.
            if (!record || record.context.saving) {
                return $.Deferred().resolve();
            }
            var changes = _.pick(
                record.data,
                this.options.fieldMap[this.master_uom_map.field_uom_qty]
            );

            if (amount === 0) {
                var lazy_qty = record.context.lazy_qty || 1;
                changes[
                    this.options.fieldMap[this.master_uom_map.field_uom_qty]
                ] = lazy_qty;
            } else if (
                changes[this.options.fieldMap[this.master_uom_map.field_uom_qty]] === 0
            ) {
                changes[this.options.fieldMap[this.master_uom_map.field_uom_qty]] = 1;
            }
            this.$card.addClass("blocked");
            return model
                ._applyChange(record.id, changes)
                .then(function() {
                    return self._saveRecord();
                })
                .then(function() {
                    var record = model.get(self.state.id);
                    self.trigger_up("update_quick_record", {
                        id: record.id,
                        on_onchange: function() {
                            self.$card.removeClass("blocked");
                            self.$card
                                .find(".o_catch_attention")
                                .removeClass("o_catch_attention");
                        },
                        on_autosave: function() {
                            self.$card.addClass("blocked");
                        },
                        on_autosaved: function() {
                            self.$card.removeClass("blocked");
                        },
                    });
                    model.updateRecordContext(self.state.id, {
                        in_timeout: false,
                    });
                });
        },

        /**
         * @private
         * @returns {Deferred}
         */
        _addProduct: function(amount) {
            var self = this;
            var model = this.options.basicFieldParams.model;
            var record = model.get(this.state.id);
            // Because we don't hide the 'add' button when the product is added form back form
            // we check if the record is in "saving" mode to prevent duplicate it.
            if (!record || record.context.saving) {
                return $.Deferred().resolve();
            }
            var changes = _.pick(
                record.data,
                this.options.fieldMap[this.master_uom_map.field_uom_qty]
            );

            if (amount === 0) {
                var lazy_qty = record.context.lazy_qty || 1;
                changes[
                    this.options.fieldMap[this.master_uom_map.field_uom_qty]
                ] = lazy_qty;
            } else if (
                changes[this.options.fieldMap[this.master_uom_map.field_uom_qty]] === 0
            ) {
                changes[this.options.fieldMap[this.master_uom_map.field_uom_qty]] = 1;
            }
            this.$card.addClass("blocked");
            return model
                ._applyChange(record.id, changes)
                .then(function() {
                    //return self._saveRecord();
                })
                .then(function() {
                    var record = model.get(self.state.id);
                    self.trigger_up("create_quick_record", {
                        id: record.id,
                        on_onchange: function() {
                            self.$card.removeClass("blocked");
                            self.$card
                                .find(".o_catch_attention")
                                .removeClass("o_catch_attention");
                        },
                        on_autosave: function() {
                            self.$card.addClass("blocked");
                        },
                        on_autosaved: function() {
                            self.$card.removeClass("blocked");
                        },
                    });
                    model.updateRecordContext(self.state.id, {
                        in_timeout: false,
                    });
                });
        },

        _modifyProductDelayed: function(amount, mode) {
            var model = this.options.basicFieldParams.model;
            var record = model.get(this.state.id);
            if (record.context.saving) {
                return;
            }
            var lazy_qty = record.context.lazy_qty || 0;
            lazy_qty += amount;
            model.updateRecordContext(this.state.id, {
                lazy_qty: lazy_qty,
                need_notify: true,
                modified: true,
                in_timeout: true,
            });
            this._processDynamicFields();
            this._updateLazyQty();
            if (!record.context.not_onchange) {
                this.trigger_up("modify_quick_record", {
                    id: this.state.id,
                });
                if (mode === "add") {
                    this._lazyAddProduct(0);
                } else if (mode === "update") {
                    this._lazyUpdateRecord(0);
                }
            }
        },

        /**
         * @private
         * @param {Selector/HTMLElement} target
         */
        _doInteractAnim: function(target) {
            var $target = $(target);
            $target.addClass("o_catch_attention");
        },

        /**
         * @private
         */
        _openPriceModifier: function() {
            var state_data = this.state && this.state.data;
            if (
                this.options.readOnlyMode ||
                !state_data ||
                (this.$modifPriceModal &&
                    (this.$modifPriceModal.data("bs.modal") || {})._isShown)
            ) {
                return;
            }
            this.trigger_up("pause_auto_save");
            var ModifPriceWidget = widgetRegistry.get(
                "product_picker_quick_modif_price_form"
            );
            var widget = new ModifPriceWidget(this, {
                fieldsInfo: this.fieldsInfo,
                fields: this.fields,
                main_state: this.getParent().state,
                state: this.state,
                fieldMap: this.options.fieldMap,
                searchRecord: this.recordSearch,
                node: this.$el,
                readonly: this.options.readOnlyMode,
                basicFieldParams: this.options.basicFieldParams,
                data: this.state && this.state.data,
                canEditPrice: this.options.editPrice,
                canEditDiscount: this.options.editDiscount,
                currencyField: this.options.currencyField,
            });

            self.$modifPriceModal = $(
                qweb.render("One2ManyProductPicker.QuickModifPrice.Modal")
            );
            self.$modifPriceModal.appendTo($(".oe_one2many_product_picker_view"));
            self.$modifPriceModal.find('.icon-waiting').removeClass('d-none');
            return widget.attachTo(self.$modifPriceModal).then(function() {
                 widget.$el.addClass("o_widget");
                 self.$modifPriceModal.modal();
            });
        },

        // HANDLE EVENTS

        /**
         * @private
         * @param {ClickEvent} evt
         */
        _onClickFlipCard: function(evt) {
            // Avoid clicks on form elements
            if (
                ["INPUT", "BUTTON", "A"].indexOf(evt.target.tagName) !== -1 ||
                this.$card.hasClass("blocked")
            ) {
                return;
            }

            var $target = $(evt.target);
            if (!this.options.readOnlyMode && this.getParent().canBeSaved(this.state.id)) {
                if (
                    $target.hasClass("add_product") ||
                    $target.parents(".add_product").length
                ) {
                    this._modifyProductDelayed(1, "add");
                    return;
                } else if (
                    $target.hasClass("product_qty") ||
                    $target.parents(".product_qty").length
                ) {
                    this._modifyProductDelayed(1, "update");
                    return;
                } else if ($target.hasClass("safezone")) {
                    // Do nothing on safe zones
                    return;
                }
            }

            this.trigger_up("pause_auto_save");
            if (!this._clickFlipCardDelayed) {
                this._clickFlipCardDelayed = setTimeout(
                    this._onClickDelayedFlipCard.bind(this, evt),
                    this._click_card_delayed_time
                );
            }
            ++this._clickFlipCardCount;
            if (this._clickFlipCardCount === 2) {
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
            var self = this;
            this._clickFlipCardDelayed = false;
            this._clickFlipCardCount = 0;

            if (this.options.readOnlyMode || !this.state || !this.getParent()) {
                return;
            }
            if (this.$card.hasClass("active")) {
                this.$card.removeClass("active");
                this.$front.removeClass("d-none");
                this.trigger_up("resume_auto_save");
            } else {
                this.trigger_up("pause_auto_save");
                this.defs = [];
                if (!this.widgets.back.length) {
                    this.$back.find('.icon-waiting').removeClass('d-none');
                    this._processWidgetFields(this.$back);
                    this._processWidgets(this.$back, "back");
                }
                this._processDynamicFields();
                $.when(this.defs).then(function() {
                    var $actived_card = self.$el.parent().find(".active");
                    $actived_card.removeClass("active");
                    $actived_card.find(".oe_flip_card_front").removeClass("d-none");
                    self.$card.addClass("active");
                    self.$card.on("transitionend", function() {
                        self.$front.addClass("d-none");
                        self.$card.off("transitionend");
                    });
                    self.trigger_up("record_flip", {
                        widget_index: self.$el.data("renderer_widget_index"),
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
            var $target = $(evt.target);
            if (
                $target.hasClass("badge_price") ||
                $target.parents(".badge_price").length
            ) {
                this._openPriceModifier();
            } else {
                var $currentTarget = $(evt.currentTarget);
                var $img = $currentTarget.find(".oe_flip_card_front img");
                var cur_img_src = $img.attr("src");
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
                    var $actived_card = this.$el.parent().find(".active");
                    if ($actived_card[0] !== $currentTarget[0]) {
                        $actived_card.removeClass("active");
                        $actived_card.find(".oe_flip_card_front").removeClass("d-none");
                    }
                    var offset = $currentTarget.offset();
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
        _onBlockCard: function(evt) {
            this.$card.toggleClass("blocked", evt.data.status);
        },

        /**
         * @private
         * @param {CustomEvent} evt
         */
        _onRestoreFlipCard: function(evt) {
            var self = this;
            this.$card.removeClass("active");
            this.$front.removeClass("d-none");
            var $img = this.$front.find("img");
            var cur_img_src = $img.attr("src");
            if (this.$card.hasClass("oe_flip_card_maximized")) {
                this.$card.removeClass("oe_flip_card_maximized");
                this.$card.on("transitionend", function() {
                    self.$card.css({
                        position: "",
                        top: "",
                        left: "",
                        width: "",
                        height: "",
                        zIndex: "",
                    });
                    self.$card.off("transitionend");
                    if (evt.data.success_callback) {
                        evt.data.success_callback();
                    }
                    self.trigger_up("resume_auto_save");
                });
            } else if (evt.data.success_callback) {
                evt.data.success_callback();
                this.trigger_up("resume_auto_save");
            } else {
                this.trigger_up("resume_auto_save");
            }
            $img.attr("src", $img.data("srcAlt"));
            $img.data("srcAlt", cur_img_src);
        },

        /**
         * When the record was modified by the "card form"
         * @private
         * @param {CustomEvent} evt
         */
        _onQuickRecordUpdated: function(evt) {
            this._processDynamicFields(Object.keys(evt.data.changes));
            this.trigger_up("update_subtotal");

            if (evt.data.highlight) {
                this.highlight(
                    evt.data.highlight === true ? undefined : evt.data.highlight
                );
            }
        },

        _onBackFormLoaded: function() {
            this.$back.find('.icon-waiting').addClass('d-none');
        },
    });

    return One2ManyProductPickerRecord;
});
