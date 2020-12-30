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

    var qweb = core.qweb;

    /* This is the renderer of the main widget */
    var One2ManyProductPickerRenderer = BasicRenderer.extend({
        className: 'oe_one2many_product_picker_view',

        events: {
            'click #productPickerLoadMore': '_onClickLoadMore',
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
            this.widgets.splice(this.widgets.indexOf(widget), 1);
            widget.destroy();
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
            if (_.isEqual(this.state.data, state.data)) {
                return this._super.apply(this, arguments);
            }
            var old_state = _.clone(this.state.data);
            return this._super(
                state,
                _.extend({}, params, {noRender: true})
            ).then(function () {
                self._updateStateRecords(old_state);
            });
        },

        /**
         * @private
         * @param {Array[Object]} states
         * @returns {Deferred}
         */
        _removeRecords: function (states) {
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
            this.widgets = _.compact(this.widgets);

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
                for (var eb = this.widgets.length-1; eb>=0; --eb) {
                    var widget = this.widgets[eb];
                    if (
                        widget.state.data[this.options.field_map.product].data.id === widget_product_id
                    ) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    var search_record = _.find(this.search_data, {id: widget_product_id});
                    var new_search_record = _.extend({}, search_record, {__id: state.id});
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
            this._removeRecords(states_to_destroy);

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
                    if (!widget) {

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

                // Need add a new one?
                if (!exists && search_record_index !== -1) {
                    var new_search_record = _.extend({}, search_record, {__id: state.id});
                    defs.push(this.appendSearchRecords([new_search_record], false, true, search_record_index)[0]);
                }
            }
            this.widgets = _.compact(this.widgets);
            _.invoke(to_destroy, "destroy");
            return $.when(defs);
        },

        /**
         * @override
         */
        _renderView: function () {
            var self = this;
            var oldWidgets = this.widgets;
            this.widgets = [];
            this.$recordsContainer = $("<DIV/>", {
                class: "w-100 row",
            });
            this.$extraButtonsContainer = $(qweb.render("One2ManyProductPicker.ExtraButtons"));
            this.$btnLoadMore = this.$extraButtonsContainer.find("#productPickerLoadMore");
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
         * Compare search results with current lines
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
                var ProductPickerRecord = new One2ManyProductPickerRecord(
                    self,
                    state_data,
                    self._getRecordOptions(search_record)
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
                    .then(function () {
                        if (typeof position !== "undefined") {
                            var $elm = self.$el.find("> div > div:nth("+position+")");
                            ProductPickerRecord.$el.insertAfter($elm);
                        }
                    });
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

    });

    return One2ManyProductPickerRenderer;
});
