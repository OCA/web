// Copyright 2020 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define("web_widget_one2many_product_picker.One2ManyProductPickerRenderer", function (
    require
) {
    "use strict";

    var core = require("web.core");
    var BasicRenderer = require("web.BasicRenderer");
    var One2ManyProductPickerRecord = require(
        "web_widget_one2many_product_picker.One2ManyProductPickerRecord");
    var ProductPickerQuickCreateForm = require(
        "web_widget_one2many_product_picker.ProductPickerQuickCreateForm");

    var qweb = core.qweb;

    /* This is the renderer of the main widget */
    var One2ManyProductPickerRenderer = BasicRenderer.extend({
        className: 'oe_one2many_product_picker_view',

        events: {
            'click #productPickerLoadMore': '_onClickLoadMore',
        },
        custom_events: {
            'record_flip': '_onRecordFlip',
        },

        DELAY_GET_RECORDS: 150,
        MIN_PERC_GET_RECORDS: 0.9,

        /**
         * @override
         */
        init: function (parent, state, params) {
            this._super.apply(this, arguments);
            this.widgets = [];
            this.recordOptions = _.extend({}, params.record_options, {
                viewType: 'One2ManyProductPicker',
            });

            // Workaround: Odoo initilize this class so we need do this to
            // 'receive' more arguments.
            this.options = parent.options;
            this.mode = parent.mode;
            this.search_data = parent._searchRecords;
            this.search_group = parent._activeSearchGroup;
            this.last_search_data_count = parent._lastSearchRecordsCount;
        },

        /**
         * Propagate the event to the view widgets
         */
        on_attach_callback: function () {
            this._isInDom = true;
            _.invoke(this.widgets, 'on_attach_callback');
        },

        /**
         * Propagate the event to the view widgets
         */
        on_detach_callback: function () {
            this._isInDom = false;
            _.invoke(this.widgets, 'on_detach_callback');
        },

        /**
         * @param {Object} widget
         */
        removeWidget: function (widget) {
            var index = this.widgets.indexOf(widget);
            widget.destroy();
            delete this.widgets[index];
        },

        /**
         * @override
         */
        start: function () {
            return this._super.apply(this, arguments);
        },

        /**
         * @param {Object} search_data
         */
        updateSearchData: function (search_data, count, search_group) {
            this.search_data = search_data;
            this.last_search_data_count = count;
            this.search_group = search_group;
            this._loadMoreWorking = false;
            this.$btnLoadMore.attr("disabled", false);
        },

        /**
         * @param {Boolean} block
         */
        blockLoadMore: function (block) {
            this.$btnLoadMore.attr("disabled", block);
        },

        /**
         * Avoid re-render 'pure virtual' states
         *
         * @override
         */
        updateState: function (state, params) {
            var self = this;
            var force_update = params.force;
            delete params.force;
            var sparams = _.extend({}, params, {noRender: true});
            if (!force_update && _.isEqual(this.state.data, state.data)) {
                return this._super(state, sparams);
            }
            var old_state = _.clone(this.state.data);
            return this._super(state, sparams).then(function () {
                self._updateStateRecords(old_state);
            });
        },

        /**
         * Recreate the given widget by the state id
         *
         * @param {String} state_id
         * @param {Object} new_state
         */
        updateRecord: function (state_id, new_state) {
            for (var eb = this.widgets.length-1; eb>=0; --eb) {
                var widget = this.widgets[eb];
                if (widget.state.id === state_id) {
                    widget.recreate(new_state);
                    break;
                }
            }
        },

        /**
         * @private
         * @param {Array[Object]} states
         * @returns {Deferred}
         */
        _removeRecords: function (states, new_states) {
            var defs = [];
            var to_destroy = [];
            for (var index_state in states) {
                var state = states[index_state];
                for (var e = this.widgets.length-1; e>=0; --e) {
                    var widget = this.widgets[e];
                    if (widget && widget.state.id === state.id) {
                        to_destroy.push(widget);
                        delete this.widgets[e];
                    }
                }
            }

            if (this.search_group.name === "main_lines") {
                _.invoke(to_destroy, "destroy");
                return $.when();
            }

            // If doesn't exists other records with the same product, we need
            // create a 'pure virtual' record again.
            for (var index_destroy in to_destroy) {
                var widget_destroyed = to_destroy[index_destroy];
                var widget_product_id = widget_destroyed.state
                    .data[this.options.field_map.product].data.id;
                var found = false;
                // If already exists a widget for the product don't try create a new one
                for (var eb = this.widgets.length-1; eb>=0; --eb) {
                    var widget = this.widgets[eb];
                    if (
                        widget &&
                        widget.state &&
                        widget.state.data[this.options.field_map.product].data.id === widget_product_id
                    ) {
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    // Get the new state ID if exists to link it with the new record
                    var new_state_id = undefined;
                    for (var eb = new_states.length-1; eb>=0; --eb) {
                        var state = new_states[eb];
                        if (
                            state.data[this.options.field_map.product].data.id === widget_product_id
                        ) {
                            new_state_id = state.id;
                            break;
                        }
                    }
                    var search_record = _.find(this.search_data, {id: widget_product_id});
                    var new_search_record = _.extend({}, search_record, {__id: new_state_id});
                    var search_record_index = widget_destroyed.$el.index();
                    defs.push(
                        this.appendSearchRecords(
                            [new_search_record],
                            false,
                            true,
                            search_record_index
                        )[0]
                    );
                }
            }

            _.invoke(to_destroy, "destroy");
            return $.when(defs);
        },

        /**
         * When the state change this method tries to update current records, delete
         * or update them.
         * Thanks to this we don't need re-render 'pure virtual' records.
         *
         * @private
         * @param {Object} old_states
         * @returns {Deferred}
         */
        _updateStateRecords: function (old_states) {

            // States to remove
            var states_to_destroy = [];
            for (var index in old_states) {
                var old_state = old_states[index];
                var found = false;
                for (var e in this.state.data) {
                    var current_state = this.state.data[e];
                    if (current_state.id === old_state.id) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    states_to_destroy.push(old_state);
                }
            }

            this.state.data = _.compact(this.state.data);
            this._removeRecords(states_to_destroy, this.state.data);

            // Records to Update or Create
            var defs = [];
            var to_destroy = [];
            for (var index in this.state.data) {
                var state = this.state.data[index];
                var exists = false;
                var search_record_index = -1;
                var search_record = false;
                for (var e = this.widgets.length-1; e>=0; --e) {
                    var widget = this.widgets[e];
                    if (!widget || !widget.state) {

                        // Already processed widget (deleted)
                        continue;
                    }
                    if (widget.state.id === state.id) {
                        widget.recreate(state);
                        exists = true;
                        break;
                    } else if (
                        widget.recordSearch.id === state.data[this.options.field_map.product].data.id
                    ) {

                        // Is a new record
                        search_record_index = widget.$el.index();
                        search_record = widget.recordSearch;
                    }

                    // Remove "pure virtual" records that have the same product that the new record
                    if (
                        widget.is_virtual &&
                        widget.state.data[this.options.field_map.product].data.id === state.data[this.options.field_map.product].data.id
                    ) {
                        to_destroy.push(widget);
                        delete this.widgets[e];
                    }
                }

                this.state.data = _.compact(this.state.data);

                // Need add a new one?
                if (!exists && search_record_index !== -1) {
                    var new_search_record = _.extend({}, search_record, {__id: state.id});
                    defs.push(this.appendSearchRecords([new_search_record], false, true, search_record_index)[0]);
                }
            }

            _.invoke(to_destroy, "destroy");
            return $.when(defs);
        },

        /**
         * @override
         */
        _renderView: function () {
            var self = this;
            var oldWidgets = _.compact(this.widgets);
            this.widgets = [];
            this.$recordsContainer = $("<DIV/>", {
                class: "w-100 row",
            });
            this.$extraButtonsContainer = $(qweb.render("One2ManyProductPicker.ExtraButtons"));
            this.$btnLoadMore = this.$extraButtonsContainer.find("#productPickerLoadMore");
            this.search_data = this._sort_search_data(this.search_data);
            return $.Deferred(function (d) {
                var defs = self.appendSearchRecords(self.search_data, true);
                defs[0].then(function () {
                    _.invoke(oldWidgets, "destroy");
                    self.$el.empty();
                    self.$el.append(self.$recordsContainer);
                    self.$el.append(self.$extraButtonsContainer);
                    self.showLoadMore(self.last_search_data_count >= self.options.records_per_page);
                    if (self._isInDom) {
                        _.invoke(self.widgets, "on_attach_callback");
                    }
                    d.resolve(defs[1]);
                });
            });
        },

        /**
         * @param {Array} datas
         * @returns {Array}
         */
        _sort_search_data: function (datas) {
            if (this.search_group.name === "main_lines") {
                var field_name = this.options.field_map.product;
                for (var index_datas in datas) {
                    var data = datas[index_datas];

                    for (var index_state in this.state.data) {
                        var state_data = this.state.data[index_state];
                        if (state_data.data[field_name].res_id === data.id) {
                            data._order_value = state_data.res_id;
                        }
                    }
                }
                var sorted_datas = _.chain(datas).sortBy('_order_value').map(function(item) {
                    return _.omit(item, '_order_value');
                }).value().reverse();
                return sorted_datas;
            }
            return datas;
        },

        /**
         * Compare search results with current lines.
         * Link a current state with the 'search record'.
         *
         * @private
         * @param {Array[Object]} results
         * @returns {Array[Object]}
         */
        _processSearchRecords: function (results) {
            var field_name = this.options.field_map.product;
            var records = [];
            for (var index in results) {
                var record_search = results[index];
                var state_data_found = false;

                for (var index_data in this.state.data) {
                    var state_record = this.state.data[index_data];
                    var field = state_record.data[field_name];
                    if (
                        (typeof field === "object" && field.data.id === record_search.id) ||
                        field === record_search.id
                    ) {
                        records.push(
                            _.extend({}, record_search, {
                                __id: state_record.id,
                            })
                        );
                        state_data_found = true;
                    }
                }
                if (!state_data_found) {
                    records.push(record_search);
                }
            }

            return records;
        },

        /**
         * @private
         * @param {Int} id
         * @returns {Object}
         */
        _getRecordDataById: function (id) {
            for (var index in this.state.data) {
                var record = this.state.data[index];
                if (record.id === id) {
                    return record;
                }
            }
            return false;
        },

        /**
         * @private
         * @param {Object} search_record
         * @returns {Object}
         */
        _getRecordOptions: function (search_record) {
            return _.extend({}, this.recordOptions, {
                fieldMap: this.options.field_map,
                searchRecord: search_record,
                basicFieldParams: this.getParent().getBasicFieldParams(),
                currencyField: this.options.currency_field,
                readOnlyMode: this.mode === "readonly",
                showDiscount: this.options.show_discount,
                editDiscount: this.options.edit_discount,
                editPrice: this.options.edit_price,
                autoSave: this.options.auto_save,
                ignoreWarning: this.options.ignore_warning,
            });
        },

        /**
         * Generates the 'Product Card' per record.
         *
         * @private
         * @param {Array[Object]} search_records
         * @param {Boolean} no_process_records
         * @param {Number} position
         */
        _appendSearchRecords: function (search_records, no_process_records, position) {
            var self = this;
            var processed_records =
                no_process_records?search_records:this._processSearchRecords(search_records);
            _.each(processed_records, function (search_record) {
                var state_data = self._getRecordDataById(search_record.__id);
                var widget_options = self._getRecordOptions(search_record);
                widget_options.renderer_widget_index = self.widgets.length;
                var ProductPickerRecord = new One2ManyProductPickerRecord(
                    self,
                    state_data,
                    widget_options
                );
                self.widgets.push(ProductPickerRecord);

                // Simulate new lines to dispatch get_default & onchange's to get the
                // relevant data to print. This case increase the TTI time.
                if (!state_data) {
                    var defVirtualState = ProductPickerRecord.generateVirtualState();
                    if (defVirtualState.state() === "pending") {
                        self.defsVirtualState.push(defVirtualState);
                    }
                }

                // At this point the widget will use the existing state (line) or
                // the search data. Using search data instead of waiting for
                // simulated state gives a low FCP time.
                var def = ProductPickerRecord.appendTo(self.$recordsContainer)
                    .then(function (widget, widget_position) {
                        if (typeof widget_position !== "undefined") {
                            var $elm = this.$el.find("> div > div:nth("+widget_position+")");
                            widget.$el.insertAfter($elm);
                        }
                    }.bind(self, ProductPickerRecord, position));
                if (def.state() === "pending") {
                    self.defs.push(def);
                }
            });
        },

        /**
         * @param {Boolean} status
         */
        showLoadMore: function (status) {
            this.$btnLoadMore.toggleClass("d-none", !status);
        },

        /**
         * Append search records to the view
         *
         * @param {Array[Object]} search_records
         * @param {Boolean} no_attach_widgets
         * @param {Boolean} no_process_records
         * @param {Number} position
         * @returns {Array[Deferred]}
         */
        appendSearchRecords: function (search_records, no_attach_widgets, no_process_records, position) {
            var self = this;
            this.trigger_up("loading_records");
            this.defs = [];
            this.defsVirtualState = [];
            var cur_widget_index = this.widgets.length;
            this._appendSearchRecords(search_records, no_process_records, position);
            var defs = this.defs;
            delete this.defs;
            var defsVirtualState = this.defsVirtualState;
            delete this.defsVirtualState;
            return [
                $.when.apply($, defs).then(function () {
                    if (!no_attach_widgets && self._isInDom) {
                        var new_widgets = self.widgets.slice(cur_widget_index);
                        _.invoke(new_widgets, "on_attach_callback");
                    }
                }),
                $.when.apply($, defsVirtualState).then(function () {
                    self.trigger_up("loading_records", {finished:true});
                }),
            ];
        },

        /**
         * @private
         */
        _onClickLoadMore: function () {
            this.$btnLoadMore.attr("disabled", true);
            this.trigger_up("load_more");
            this._loadMoreWorking = true;
        },

        /**
         * Do card flip
         *
         * @param {Integer} index
         */
        doWidgetFlip: function (index) {
            var widget = this.widgets[index];
            var $actived_card = this.$el.find(".active");
            if (widget.$card.hasClass("active")) {
                widget.$card.removeClass("active");
                widget.$card.find('.oe_flip_card_front').removeClass("d-none");
            } else {
                var self = widget;
                widget.defs = [];
                widget._processWidgetFields(widget.$back);
                widget._processWidgets(widget.$back);
                widget._processDynamicFields();
                $.when(widget.defs).then(function () {
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
         * Handle card flip.
         * Used to create/update the record
         *
         * @param {CustomEvent} evt
         */
        _onRecordFlip: function (evt) {
            var prev_widget_index = evt.data.prev_widget_index;
            if (typeof prev_widget_index !== "undefined") {
                // Only check 'back' widgets so there is where the form was created
                for (var index in this.widgets[prev_widget_index].widgets.back) {
                    var widget = this.widgets[prev_widget_index].widgets.back[index];
                    if (widget instanceof ProductPickerQuickCreateForm) {
                        widget.controller.auto();
                    }
                }
            }
        }

    });

    return One2ManyProductPickerRenderer;
});
