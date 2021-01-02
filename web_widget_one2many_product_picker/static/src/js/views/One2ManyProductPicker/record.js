/* global py */
// Copyright 2020 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define("web_widget_one2many_product_picker.One2ManyProductPickerRecord", function (
    require
) {
    "use strict";

    var core = require("web.core");
    var Widget = require("web.Widget");
    var Domain = require("web.Domain");
    var widgetRegistry = require("web.widget_registry");
    var tools = require("web_widget_one2many_product_picker.tools");
    var ProductPickerQuickModifPriceForm = require(
        "web_widget_one2many_product_picker.ProductPickerQuickModifPriceForm");

    var qweb = core.qweb;
    var _t = core._t;

    /* This represent a record (a card) */
    var One2ManyProductPickerRecord = Widget.extend({
        custom_events: {
            quick_record_updated: "_onQuickRecordUpdated",
            restore_flip_card: "_onRestoreFlipCard",
        },
        events: {
            "click .oe_flip_card": "_onClickFlipCard",
        },

        _click_card_delayed_time: 250,

        /**
         * @override
         */
        init: function (parent, state, options) {
            this._super(parent);
            this.options = options;
            this.subWidgets = {};
            this._clickFlipCardCount = 0;
            this._setState(state, options.searchRecord);
            this.widgets = [];
        },

        /**
         * Generates a new virtual state and recreates the product card
         *
         * @returns {Object}
         */
        generateVirtualState: function () {
            return this._generateVirtualState().then(this.recreate.bind(this));
        },

        /**
         * @override
         */
        start: function () {
            return $.when(this._super.apply(this, arguments), this._render());
        },

        /**
         * @override
         */
        on_attach_callback: function () {
            _.invoke(this.subWidgets, "on_attach_callback");
        },

        /**
         * @override
         */
        on_detach_callback: function () {
            _.invoke(this.subWidgets, "on_detach_callback");
        },

        /**
         * @override
         */
        update: function (record) {

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
         */
        recreate: function (state) {
            if (state) {
                this._setState(state);
            }
            this.on_detach_callback();
            return this._render();
        },

        /**
         * Generates the URL for the given product using the selected field
         *
         * @private
         * @param {Number} product_id
         * @param {String} field_name
         * @returns {String}
         */
        _getImageUrl: function (product_id, field_name) {
            return _.str.sprintf(
                "/web/image/product.product/%d/%s",
                product_id,
                field_name);
        },

        /**
         * Prints the given field value using the selected format
         *
         * @private
         * @param {String} price_field
         */
        _getMonetaryFieldValue: function (price_field) {
            var field_name = this.options.fieldMap[price_field];
            var price = this.state.data[field_name];
            return tools.monetary(
                price,
                this.state.fields[field_name],
                this.options.currencyField,
                this.state.data);
        },

        /**
         * @private
         * @param {String} d a stringified domain
         * @returns {Boolean} the domain evaluted with the current values
         */
        _computeDomain: function (d) {
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
        _setState: function (viewState, recordSearch) {

            // No parent = product_pricker widget destroyed
            // So this is a 'zombie' record. Destroy it!
            if (!this.getParent()) {
                this.on_detach_callback();
                this.destroy();
                return;
            }

            this.fields = this.getParent().state.fields;
            this.fieldsInfo = this.getParent().state.fieldsInfo.form;
            this.state = viewState;
            if (recordSearch) {
                this.recordSearch = recordSearch;
            }
            var model = this.options.basicFieldParams.model;
            this.is_virtual = this.state && model.isPureVirtual(this.state.id) || false;
        },

        /**
         * @private
         * @returns {Object}
         */
        _getQWebContext: function () {

            // Using directly the 'model record' instead of the state because
            // the state it's a parsed version of this record that doesn't
            // contains the '_virtual' attribute.
            return {
                record_search: this.recordSearch,
                user_context: this.getSession() && this.getSession().user_context || {},
                image: this._getImageUrl.bind(this),
                compute_domain: this._computeDomain.bind(this),
                state: this.state,
                field_map: this.options.fieldMap,
                widget: this,
                monetary: this._getMonetaryFieldValue.bind(this),
                show_discount: this.options.showDiscount,
                is_virtual: this.is_virtual,
                active_model: '',
            };
        },

        /**
         * Forced context used in virtual states
         *
         * @private
         * @returns {Object}
         */
        _getInternalVirtualRecordContext: function () {
            var context = {};
            context["default_" + this.options.basicFieldParams.relation_field] =
                this.options.basicFieldParams.state.id || null;
            return context;
        },

        /**
         * Forced data used in virtual states.
         * Be careful with the onchanges sequence. Think as user interaction, not as CRUD operation.
         *
         * @private
         * @returns {Object}
         */
        _getInternalVirtualRecordData: function () {
            var data = {};
            data[this.options.fieldMap.product] = {
                operation: 'ADD',
                id: this.recordSearch.id,
            };
            return data;
        },

        /**
         * @private
         * @param {Object} data
         * @param {Object} context
         * @returns {Object}
         */
        _generateVirtualState: function (data, context) {
            var model = this.options.basicFieldParams.model;
            var scontext = _.extend(
                {}, this._getInternalVirtualRecordContext(), context);
            var sdata = _.extend({}, this._getInternalVirtualRecordData(), data);
            return model.createVirtualRecord(
                this.options.basicFieldParams.value.id, {
                    data: sdata,
                    context: scontext,
                });
        },

        /**
         * @override
         */
        _render: function () {
            this.defs = [];
            this._replaceElement(
                qweb.render(
                    "One2ManyProductPicker.FlipCard",
                    this._getQWebContext()
                )
            );
            this.$card = this.$(".oe_flip_card");
            this.$front = this.$(".oe_flip_card_front");
            this.$back = this.$(".oe_flip_card_back");
            this._processWidgetFields(this.$front);
            this._processWidgets(this.$front);
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
        _processWidgetFields: function ($container) {
            var self = this;
            $container.find("field").each(function () {
                var $field = $(this);
                if ($field.parents("widget").length) {
                    return;
                }
                var field_name = $field.attr("name");
                var field_widget = $field.attr("widget");

                // a widget is specified for that field or a field is a many2many ;
                // in this latest case, we want to display the widget many2manytags
                // even if it is not specified in the view.
                if (field_widget || self.fields[field_name].type === "many2many") {
                    var widget = self.subWidgets[field_name];
                    if (widget) {

                        // a widget already exists for that field, so reset it
                        // with the new state
                        widget.reset(self.state);
                        $field.replaceWith(widget.$el);
                    } else {

                        // the widget doesn't exist yet, so instanciate it
                        var Widget = self.fieldsInfo[field_name].Widget;
                        if (Widget) {
                            widget = self._processWidget($field, field_name, Widget);
                            self.subWidgets[field_name] = widget;
                        } else if (config.debug) {

                            // the widget is not implemented
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
        _processWidget: function ($field, field_name, Widget) {

            // some field's attrs might be record dependent (they start with
            // 't-att-') and should thus be evaluated, which is done by qweb
            // we here replace those attrs in the dict of attrs of the state
            // by their evaluted value, to make it transparent from the
            // field's widgets point of view
            // that dict being shared between records, we don't modify it
            // in place
            var attrs = Object.create(null);
            _.each(this.fieldsInfo[field_name], function (value, key) {
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
            var widget = new Widget(
                this, field_name,
                this.getParent().state,
                options);
            var def = widget.replace($field);
            if (def.state() === "pending") {
                this.defs.push(def);
            }
            return widget;
        },

        /**
         * Initialize widgets using "widget" tag
         *
         * @private
         * @param {jQueryElement} $container
         */
        _processWidgets: function ($container) {
            var self = this;
            $container.find("widget").each(function () {
                var $field = $(this);
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

                self.widgets.push(widget);

                var def = widget
                    ._widgetRenderAndInsert(function () {
                        // Do nothing
                    }).then(function () {
                        widget.$el.addClass("o_widget");
                        $field.replaceWith(widget.$el);
                    });
                if (def.state() === "pending") {
                    self.defs.push(def);
                }
            });
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
         * @param {Array[String]} fields
         */
        _processDynamicFields: function (fields) {
            if (!this.state) {
                return;
            }
            var self = this;
            var model = this.options.basicFieldParams.model;
            var record = model.get(this.state.id);
            var state_data = record.data;

            var to_find = [];
            if (!_.isEmpty(fields)) {
                to_find = _.map(fields, function (field) {
                    return _.str.sprintf("[data-field=%s]", [field]);
                });
            } else {
                to_find = ["[data-field]"];
            }

            this.$el.find(to_find.join()).each(function () {
                var $elm = $(this);
                var format_out = $elm.data("esc") || $elm.data("field");
                $elm.html(
                    py.eval(format_out, _.extend({}, state_data, self.recordSearch))
                );
            });

            if (this.options.showDiscount) {
                var field_map = this.options.fieldMap;
                if (state_data) {
                    var has_discount = state_data[field_map.discount] > 0.0;
                    this.$el.find(".original_price,.discount_price")
                        .toggleClass("d-none", !has_discount);
                    if (has_discount) {
                        this.$el.find(".price_unit").html(this._calcPriceReduced());
                    } else {
                        this.$el.find(".price_unit").html(
                            this._getMonetaryFieldValue("price_unit"));
                    }
                }
            }
        },

        /**
         * @private
         * @returns {String}
         */
        _calcPriceReduced: function () {
            var price_reduce = 0;
            var field_map = this.options.fieldMap;
            var state_data = this.state.data;
            if (state_data && state_data[field_map.discount]) {
                price_reduce = tools.priceReduce(
                    state_data[field_map.price_unit],
                    state_data[field_map.discount]);
            }
            return price_reduce && tools.monetary(
                price_reduce,
                this.state.fields[field_map.price_unit],
                this.options.currencyField,
                this.state.data
            );
        },

        /**
         * @private
         */
        _openPriceModifier: function () {
            var state_data = this.state && this.state.data;
            if (this.options.readOnlyMode || !state_data) {
                return;
            }
            var modif_price_form = new ProductPickerQuickModifPriceForm(this, {
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
            this.$modifPricePopup = $(
                qweb.render("One2ManyProductPicker.QuickModifPricePopup"));
            this.$modifPricePopup.appendTo($(".o_main_content"));
            modif_price_form.attachTo(this.$modifPricePopup);
        },

        // HANDLE EVENTS

        /**
         * @private
         * @param {ClickEvent} evt
         */
        _onClickFlipCard: function (evt) {

            // Avoid clicks on form elements
            if (['INPUT', 'BUTTON', 'A'].indexOf(evt.target.tagName) !== -1) {
                return;
            }
            if (!this._clickFlipCardDelayed) {
                this._clickFlipCardDelayed = setTimeout(
                    this._onClickDelayedFlipCard.bind(this, evt),
                    this._click_card_delayed_time);
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
        _onClickDelayedFlipCard: function () {
            this._clickFlipCardDelayed = false;
            this._clickFlipCardCount = 0;

            if (this.options.readOnlyMode || !this.state) {
                return;
            }
            if (this.$card.hasClass("active")) {
                this.$card.removeClass("active");
                this.$card.find('.oe_flip_card_front').removeClass("d-none");
            } else {
                var self = this;
                this.defs = [];
                this._processWidgetFields(this.$back);
                this._processWidgets(this.$back);
                this._processDynamicFields();
                $.when(this.defs).then(function () {
                    var $actived_card = self.$el.parent().find(".active");
                    $actived_card.removeClass("active");
                    $actived_card.find('.oe_flip_card_front').removeClass("d-none");
                    self.$card.addClass("active");
                    setTimeout(function () {
                        self.$('.oe_flip_card_front').addClass("d-none");
                    }, 200);
                });
            }
        },

        /**
         * @private
         * @param {MouseEvent} evt
         */
        _onDblClickDelayedFlipCard: function (evt) {
            var $target = $(evt.target);
            if (
                $target.hasClass('badge_price') ||
                $target.parents('.badge_price').length
            ) {
                this._openPriceModifier();
            } else {
                var $currentTarget = $(evt.currentTarget);
                var $img = $currentTarget.find(".oe_flip_card_front img");
                var cur_img_src = $img.attr("src");
                if ($currentTarget.hasClass('oe_flip_card_maximized')) {
                    $currentTarget.removeClass('oe_flip_card_maximized');
                    $currentTarget.on('transitionend', function () {
                        $currentTarget.css({
                            position: "",
                            top: "",
                            left: "",
                            width: "",
                            height: "",
                            zIndex: "",
                        });
                        $currentTarget.off('transitionend');
                    });
                } else {
                    var $actived_card = this.$el.parent().find(".active");
                    if ($actived_card[0] !== $currentTarget[0]) {
                        $actived_card.removeClass("active");
                        $actived_card.find('.oe_flip_card_front')
                            .removeClass("d-none");
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
                    _.defer(function () {
                        $currentTarget.addClass('oe_flip_card_maximized');
                    });
                }
                $img.attr("src", $img.data("srcAlt"));
                $img.data("srcAlt", cur_img_src);
            }
        },

        /**
         * @private
         */
        _onRestoreFlipCard: function () {
            this.$(".oe_flip_card").removeClass("active");
            this.$('.oe_flip_card_front').removeClass("d-none");
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
        _onQuickRecordUpdated: function (evt) {
            this._processDynamicFields(Object.keys(evt.data.changes));
            this.trigger_up("update_subtotal");
        },
    });

    return One2ManyProductPickerRecord;
});
