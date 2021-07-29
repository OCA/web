// Copyright 2020 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define(
    "web_widget_one2many_product_picker.One2ManyProductPickerRenderer",
    function(require) {
        "use strict";

        const core = require("web.core");
        const BasicRenderer = require("web.BasicRenderer");
        const One2ManyProductPickerRecord = require("web_widget_one2many_product_picker.One2ManyProductPickerRecord");
        const ProductPickerQuickCreateForm = require("web_widget_one2many_product_picker.ProductPickerQuickCreateForm");

        const qweb = core.qweb;

        /* This is the renderer of the main widget */
        const One2ManyProductPickerRenderer = BasicRenderer.extend({
            className: "oe_one2many_product_picker_view",

            events: {
                "click #productPickerLoadMore": "_onClickLoadMore",
            },
            custom_events: {
                record_flip: "_onRecordFlip",
            },

            DELAY_GET_RECORDS: 150,
            MIN_PERC_GET_RECORDS: 0.9,

            /**
             * @override
             */
            init: function(parent, state, params) {
                this._super.apply(this, arguments);
                this.widgets = [];
                this.recordOptions = _.extend({}, params.record_options, {
                    viewType: "One2ManyProductPicker",
                });

                // Workaround: Odoo initilize this class so we need do this to
                // 'receive' more arguments.
                this.options = parent.options;
                this.mode = parent.mode;
                this.search_group = parent._activeSearchGroup;
            },

            /**
             * Propagate the event to the view widgets
             */
            on_attach_callback: function() {
                this._isInDom = true;
                _.invoke(_.compact(this.widgets), "on_attach_callback");
            },

            /**
             * Propagate the event to the view widgets
             */
            on_detach_callback: function() {
                this._isInDom = false;
                _.invoke(_.compact(this.widgets), "on_detach_callback");
            },

            /**
             * @param {Object} widget
             */
            removeWidget: function(widget) {
                const index = this.widgets.indexOf(widget);
                widget.destroy();
                delete this.widgets[index];
            },

            /**
             * @override
             */
            start: function() {
                return this._super.apply(this, arguments);
            },

            /**
             * @param {Object} search_group
             */
            updateSearchGroup: function(search_group) {
                this.search_group = search_group;
            },

            /**
             * @param {Boolean} block
             */
            blockLoadMore: function(block) {
                this.$btnLoadMore.attr("disabled", block);
            },

            /**
             * Avoid re-render 'pure virtual' states
             *
             * @override
             */
            updateState: function(state, params) {
                const force_update = params.force;
                delete params.force;
                const sparams = _.extend({}, params, {noRender: true});
                if (!force_update && _.isEqual(this.state.data, state.data)) {
                    return this._super(state, sparams);
                }
                const old_state = _.clone(this.state.data);
                return this._super(state, sparams).then(() => {
                    this._updateStateRecords(old_state);
                });
            },

            /**
             * Because this widget doesn't support comments/sections line types
             * we need check if the line is valid to be shown.
             *
             * @private
             * @param {Object} state
             * @returns {Boolean}
             */
            _isValidLineState: function(state) {
                return (
                    state.data[this.options.field_map.product] &&
                    state.data[this.options.field_map.product].data.id
                );
            },

            /**
             * @private
             * @param {Object} state_a
             * @param {Object} state_b
             * @returns {Boolean}
             */
            _isEqualState: function(state_a, state_b) {
                if (state_a.id === state_b.id) {
                    return true;
                }
                const product_id_a =
                    state_a.data[this.options.field_map.product].data.id;
                const product_uom_id_a =
                    state_a.data[this.options.field_map.product_uom].data.id;
                const product_id_b =
                    state_b.data[this.options.field_map.product].data.id;
                const product_uom_id_b =
                    state_b.data[this.options.field_map.product_uom].data.id;

                return (
                    product_id_a === product_id_b &&
                    product_uom_id_a === product_uom_id_b
                );
            },

            /**
             * @private
             * @param {Object} state
             * @returns {Boolean}
             */
            _existsWidgetWithState: function(state) {
                for (let eb = this.widgets.length - 1; eb >= 0; --eb) {
                    const widget = this.widgets[eb];
                    if (
                        widget &&
                        widget.state &&
                        this._isEqualState(widget.state, state)
                    ) {
                        return true;
                    }
                }
                return false;
            },

            /**
             * When destroy states we need check if pure virtual records
             * are affected to recreate a new one because this widget can't
             * remove pure virtual records.
             *
             * @private
             * @param {Array} states
             * @returns {Array}
             */
            _processStatesToDestroy: function(states) {
                // Get widgets to destroy
                // Update states only affect to "non pure virtual" records
                const to_destroy = [];
                const to_add = [];
                for (const state of states) {
                    for (let e = this.widgets.length - 1; e >= 0; --e) {
                        const widget = this.widgets[e];
                        if (widget && this._isEqualState(widget.state, state)) {
                            // If already exists a widget for the product don't try create a new one
                            let recreated = false;
                            if (!this._existsWidgetWithState(widget.state)) {
                                // Get the new state ID if exists to link it with the new record
                                // This happens when remove a record that have a new state info
                                for (
                                    let eb = this.state.data.length - 1;
                                    eb >= 0;
                                    --eb
                                ) {
                                    const state = this.state.data[eb];
                                    if (!this._isValidLineState(state)) {
                                        continue;
                                    }
                                    if (this._isEqualState(state, widget.state)) {
                                        widget.recreate(state);
                                        recreated = true;
                                        break;
                                    }
                                }
                            }
                            if (!recreated) {
                                widget.markToDestroy();
                                to_destroy.push(widget);
                                const search_record = _.omit(
                                    widget.recordSearch,
                                    "__id"
                                );

                                to_add.push([
                                    [search_record],
                                    {
                                        no_attach_widgets: false,
                                        no_process_records: false,
                                        position: widget.state.id,
                                    },
                                ]);
                            }
                        }
                    }
                }

                return [to_destroy, to_add];
            },

            /**
             * We need check current states to ensure that doesn't exists duplications,
             * update the existing and add the new ones.
             *
             * @private
             * @returns {Array}
             */
            _processCurrentStates: function() {
                // Records to Update or Create
                const model = this.getParent().getBasicFieldParams().model;
                const to_destroy = [];
                const to_add = [];
                for (const index in this.state.data) {
                    const state = this.state.data[index];
                    if (!this._isValidLineState(state)) {
                        continue;
                    }
                    let exists = false;
                    let search_record_index = false;
                    let search_record = false;
                    for (let e = this.widgets.length - 1; e >= 0; --e) {
                        const widget = this.widgets[e];
                        if (!widget || !widget.state) {
                            // Already processed widget (deleted)
                            continue;
                        }

                        const is_equal_state = this._isEqualState(widget.state, state);
                        if (widget.isMarkedToDestroy()) {
                            exists = true;
                        } else if (is_equal_state) {
                            const record = model.get(widget.state.id);
                            model.updateRecordContext(state.id, {
                                lazy_qty: record.context.lazy_qty || 0,
                            });
                            widget.recreate(state);
                            exists = true;
                            break;
                        }
                        if (
                            !is_equal_state &&
                            widget.recordSearch.id ===
                                state.data[this.options.field_map.product].data.id
                        ) {
                            // Is a new record (can be other record for the same 'search record' or a replacement for a pure virtual)
                            search_record_index = widget.state.id;
                            search_record = widget.recordSearch;
                            const record = model.get(widget.state.id);
                            model.updateRecordContext(state.id, {
                                lazy_qty: record.context.lazy_qty || 0,
                            });
                        }

                        // Remove "pure virtual" records that have the same product that the new record
                        if (
                            widget.is_virtual &&
                            this._isEqualState(widget.state, state)
                        ) {
                            to_destroy.push(widget);
                            delete this.widgets[e];
                        }
                    }

                    this.state.data = _.compact(this.state.data);

                    // Add to create the new record
                    if (!exists && search_record_index) {
                        const new_search_record = _.extend({}, search_record, {
                            __id: state.id,
                        });
                        to_add.push([
                            [new_search_record],
                            {
                                no_attach_widgets: true,
                                no_process_records: true,
                                position: search_record_index,
                            },
                        ]);
                    }
                }

                return [to_destroy, to_add];
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
            _updateStateRecords: function(old_states) {
                // States to remove
                const states_to_destroy = [];
                for (const index in old_states) {
                    const old_state = old_states[index];
                    if (!this._isValidLineState(old_state)) {
                        continue;
                    }
                    let found = false;
                    for (const e in this.state.data) {
                        const current_state = this.state.data[e];
                        if (!this._isValidLineState(current_state)) {
                            continue;
                        }
                        if (this._isEqualState(current_state, old_state)) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        states_to_destroy.push(old_state);
                    }
                }

                const def = $.Deferred();
                this.state.data = _.compact(this.state.data);
                const [to_destroy_old, to_add_virtual] = this._processStatesToDestroy(
                    states_to_destroy
                );

                const [
                    destroyed_current,
                    to_add_current,
                ] = this._processCurrentStates();

                const currentTasks = [];
                const to_add = [].concat(to_add_current, to_add_virtual);
                for (const params of to_add) {
                    currentTasks.push(this.appendSearchRecords.apply(this, params)[0]);
                }

                Promise.all(currentTasks).then(() => {
                    _.invoke(to_destroy_old, "destroy");
                    _.invoke(destroyed_current, "destroy");
                    this.widgets = _.difference(this.widgets, to_destroy_old);
                    def.resolve();
                });

                return def;
            },

            clearRecords: function() {
                _.invoke(_.compact(this.widgets), "destroy");
                this.widgets = [];
                if (this.$recordsContainer) {
                    this.$recordsContainer.empty();
                }
            },

            /**
             * @override
             */
            _renderView: function() {
                _.invoke(_.compact(this.widgets), "destroy");
                this.widgets = [];
                this.$recordsContainer = $("<DIV/>", {
                    class: "w-100 row",
                });
                this.$extraButtonsContainer = $(
                    qweb.render("One2ManyProductPicker.ExtraButtons")
                );
                this.$btnLoadMore = this.$extraButtonsContainer.find(
                    "#productPickerLoadMore"
                );
                // This.search_data = this._sort_search_data(this.search_data);
                this.$el.empty();
                this.$el.append(this.$recordsContainer);
                this.$el.append(this.$extraButtonsContainer);
                // This.showLoadMore(
                //     this.last_search_data_count >= this.options.records_per_page
                // );
                return this._super.apply(this, arguments);
            },

            /**
             * @private
             * @param {Array} datas
             * @returns {Array}
             */
            _sort_search_data: function(datas) {
                if (this.search_group.name === "main_lines") {
                    const field_name = this.options.field_map.product;
                    for (const index_datas in datas) {
                        const data = datas[index_datas];

                        for (const index_state in this.state.data) {
                            const state_data = this.state.data[index_state];
                            if (
                                this._isValidLineState(state_data) &&
                                state_data.data[field_name].res_id === data.id
                            ) {
                                data._order_value = state_data.res_id;
                            }
                        }
                    }
                    const sorted_datas = _.chain(datas)
                        .sortBy("_order_value")
                        .map(item => _.omit(item, "_order_value"))
                        .value()
                        .reverse();
                    return sorted_datas;
                }
                return datas;
            },

            /**
             * Compare search results with current lines.
             * Link a current state with the 'search record'.
             *
             * @private
             * @param {Array} results
             * @returns {Array}
             */
            _processSearchRecords: function(results) {
                const field_name = this.options.field_map.product;
                const records = [];
                const states = [];

                var test_values = function(field_value, record_search) {
                    return (
                        (typeof field_value === "object" &&
                            field_value.data.id === record_search.id) ||
                        field_value === record_search.id
                    );
                };

                for (const index in results) {
                    const record_search = results[index];
                    let state_data_found = false;

                    // Analyze 'pure virtual' records
                    // Pure virtual records aren't linked with field list
                    // so we need search them linked in the widgets.
                    for (const index_widget in this.widgets) {
                        const widget = this.widgets[index_widget];
                        if (widget.isMarkedToDestroy()) {
                            continue;
                        }
                        if (
                            record_search.__id === widget.state.id ||
                            (!record_search.__id &&
                                widget.recordSearch.id === record_search.id)
                        ) {
                            state_data_found = true;
                            if (widget.state) {
                                states.push(widget.state);
                            }
                            break;
                        }
                    }

                    // If already exists a widget with the search result
                    // avoid create a new one
                    if (state_data_found) {
                        continue;
                    }

                    // Analyze field records
                    // If not found any widget we need create a new one
                    // linked with the state record
                    for (const index_data in this.state.data) {
                        const state_record = this.state.data[index_data];
                        if (!this._isValidLineState(state_record)) {
                            continue;
                        }
                        const field_value = state_record.data[field_name];
                        if (test_values(field_value, record_search)) {
                            records.push(
                                _.extend({}, record_search, {
                                    __id: state_record.id,
                                })
                            );
                            states.push(state_record);
                            state_data_found = true;
                        }
                    }

                    if (!state_data_found) {
                        records.push(record_search);
                    }
                }

                return {
                    records: records,
                    states: states,
                };
            },

            /**
             * @private
             * @param {Int} id
             * @returns {Object}
             */
            _getRecordDataById: function(id) {
                for (const index in this.state.data) {
                    const record = this.state.data[index];
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
            _getRecordOptions: function(search_record) {
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
             * @param {Array} search_records
             * @param {Object} options
             */
            _appendSearchRecords: function(search_records, options) {
                const processed_info = options.no_process_records
                    ? search_records
                    : this._processSearchRecords(search_records);
                const records_to_add = processed_info.records || search_records;
                _.each(records_to_add, search_record => {
                    const state_data = this._getRecordDataById(search_record.__id);
                    const widget_options = this._getRecordOptions(search_record);
                    widget_options.renderer_widget_index = this.widgets.length;
                    const ProductPickerRecord = new One2ManyProductPickerRecord(
                        this,
                        state_data,
                        widget_options
                    );
                    this.widgets.push(ProductPickerRecord);

                    // Simulate new lines to dispatch get_default & onchange's to get the
                    // relevant data to print. This case increase the TTI time.
                    if (!state_data) {
                        const defVirtualState = ProductPickerRecord.generateVirtualState(
                            this.options.instant_search
                        );
                        this.defsVirtualState.push(defVirtualState);
                    }

                    // At this point the widget will use the existing state (line) or
                    // a simple state data. Using simple state data instead of waiting for
                    // complete state (default + onchange) gives a low FCP time.
                    const def = $.Deferred();
                    ProductPickerRecord.appendTo(this.$recordsContainer).then(
                        function(widget, widget_position) {
                            if (typeof widget_position !== "undefined") {
                                const $elm = this.$el.find(
                                    `[data-card-id="${widget_position}"]:first`
                                );
                                widget.$el.insertBefore($elm);
                            }
                            def.resolve();
                        }.bind(this, ProductPickerRecord, options.position)
                    );
                    this.defs.push(def);
                });
                // Destroy unused
                if (options.cleanup) {
                    const num_widgets = this.widgets.length;
                    for (
                        let index_widget = num_widgets - 1;
                        index_widget >= 0;
                        --index_widget
                    ) {
                        const widget = this.widgets[index_widget];
                        let found_state = false;
                        for (const state of processed_info.states) {
                            if (widget.state && widget.state.id === state.id) {
                                found_state = true;
                                break;
                            }
                        }
                        if (!found_state && widget.state) {
                            widget.destroy();
                            delete this.widgets[index_widget];
                        }
                    }
                    // Clean widget array
                    this.widgets = _.compact(this.widgets);
                }
            },

            /**
             * @param {Boolean} status
             */
            showLoadMore: function(status) {
                this.$btnLoadMore.toggleClass("d-none", !status);
            },

            /**
             * Append search records to the view
             *
             * @param {Array} search_records
             * @param {Object} options
             * @returns {Array}
             */
            appendSearchRecords: function(search_records, options = {}) {
                this.trigger_up("loading_records");
                this.defs = [];
                this.defsVirtualState = [];
                const cur_widget_index = this.widgets.length;
                this._appendSearchRecords(search_records, options);

                const defs = this.defs;
                delete this.defs;
                const defsVirtualState = this.defsVirtualState;
                delete this.defsVirtualState;
                return [
                    Promise.all(defs).then(() => {
                        if (!options.no_attach_widgets && this._isInDom) {
                            const new_widgets = this.widgets.slice(cur_widget_index);
                            _.invoke(new_widgets, "on_attach_callback");
                        }
                    }),
                    Promise.all(defsVirtualState).then(() => {
                        this.trigger_up("loading_records", {finished: true});
                    }),
                ];
            },

            /**
             * @private
             */
            _onClickLoadMore: function() {
                this.$btnLoadMore.attr("disabled", true);
                this.trigger_up("load_more");
            },

            /**
             * Do card flip
             *
             * @param {Integer} index
             */
            doWidgetFlip: function(index) {
                const widget = this.widgets[index];
                const $actived_card = this.$el.find(".active");
                if (widget.$card.hasClass("active")) {
                    widget.$card.removeClass("active");
                    widget.$card.find(".oe_flip_card_front").removeClass("d-none");
                } else {
                    widget.defs = [];
                    widget._processWidgetFields(widget.$back);
                    widget._processWidgets(widget.$back);
                    widget._processDynamicFields();
                    $.when(widget.defs).then(() => {
                        $actived_card.removeClass("active");
                        $actived_card.find(".oe_flip_card_front").removeClass("d-none");
                        widget.$card.addClass("active");
                        setTimeout(() => {
                            widget.$(".oe_flip_card_front").addClass("d-none");
                        }, 200);
                    });
                }
            },

            /**
             * Handle card flip.
             * Used to create/update the record
             *
             * @private
             * @param {CustomEvent} evt
             */
            _onRecordFlip: function(evt) {
                const prev_widget_index = evt.data.prev_widget_index;
                if (typeof prev_widget_index !== "undefined") {
                    // Only check 'back' widgets so there is where the form was created
                    for (const index in this.widgets[prev_widget_index].widgets.back) {
                        const widget = this.widgets[prev_widget_index].widgets.back[
                            index
                        ];
                        if (widget instanceof ProductPickerQuickCreateForm) {
                            widget.controller.auto();
                        }
                    }
                }
            },
        });

        return One2ManyProductPickerRenderer;
    }
);
