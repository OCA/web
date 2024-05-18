// Copyright 2020 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define(
    "web_widget_one2many_product_picker.One2ManyProductPickerRenderer",
    function(require) {
        "use strict";

        var core = require("web.core");
        var BasicRenderer = require("web.BasicRenderer");
        var One2ManyProductPickerRecord = require("web_widget_one2many_product_picker.One2ManyProductPickerRecord");

        var qweb = core.qweb;

        /* This is the renderer of the main widget */
        var One2ManyProductPickerRenderer = BasicRenderer.extend({
            className: "oe_one2many_product_picker_view",

            events: {
                "click #productPickerLoadMore": "_onClickLoadMore",
            },
            custom_events: {
                record_flip: "_onRecordFlip",
            },

            _instant_search_onchange_delay: 250,

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
                var self = this;
                var force_update = params.force;
                delete params.force;
                var sparams = _.extend({}, params, {noRender: true});
                if (!force_update && _.isEqual(this.state.data, state.data)) {
                    return this._super(state, sparams);
                }
                var old_state = _.clone(this.state.data);
                return this._super(state, sparams).then(function() {
                    self._updateStateRecords(old_state);
                });
            },

            canBeUpdated: function() {
                if (!this.getParent()) {
                    return false;
                }
                var model = this.getParent().getBasicFieldParams().model;
                for (var widget of this.widgets) {
                    if (!widget.state) {
                        return false;
                    }
                    var record = model.localData[widget.state.id];
                    if (record.context.in_timeout) {
                        return false;
                    }
                }
                return true;
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
                    state &&
                    state.data[this.options.field_map.product] &&
                    state.data[this.options.field_map.product].data &&
                    typeof state.data[this.options.field_map.product].data.id !==
                        "undefined"
                );
            },

            getProductIdFromState: function(state) {
                return (
                    state &&
                    state.data[this.options.field_map.product] &&
                    state.data[this.options.field_map.product].data &&
                    state.data[this.options.field_map.product].data.id
                );
            },

            getWidgetsByProduct: function(product_id) {
                var self = this;
                return _.filter(this.widgets, function(item) {
                    return (
                        self.getProductIdFromState(item.state) === product_id ||
                        item.recordSearch.id === product_id
                    );
                });
            },

            getWidgetsWithoutOnchange: function() {
                if (!this.getParent()) {
                    return false;
                }
                var model = this.getParent().getBasicFieldParams().model;
                return _.filter(this.widgets, function(item) {
                    return (
                        model.localData[item.state.id] && model.localData[item.state.id].context.not_onchange
                    );
                });
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
            _processStatesToDestroy: function(old_states) {
                var self = this;
                // States to remove
                // In 12.0, Odoo generates new ids for the states, so
                // all states will be removed and restored because it's
                // not possible identify a record without this id
                var to_destroy_ids = [];
                for (var index in old_states) {
                    var old_state = old_states[index];
                    if (!this._isValidLineState(old_state)) {
                        continue;
                    }
                    var in_current_state = _.some(this.state.data, function(state) {
                        return (
                            self._isValidLineState(state) && (state.id === old_state.id)
                        );
                    });
                    if (!in_current_state) {
                        to_destroy_ids.push(old_state.id);
                    }
                }

                var model = this.getParent().getBasicFieldParams().model;
                var to_destroy = [];
                for (var widget of this.widgets) {
                    if (!widget) {
                        continue;
                    }

                    // Verify that doesn't exists any dead widget
                    // This is necessary beceause auto-save uses
                    // ADD + SAVE that generates two different
                    // state ids
                    var state_has_onchange =
                        widget.state && !widget.state.context.not_onchange;
                    var state_has_modified =
                        widget.state && !widget.state.context.modified;
                    if (
                        !state_has_modified &&
                        state_has_onchange &&
                        !model.isPureVirtual(widget.state.id)
                    ) {
                        to_destroy.push(widget);
                        continue;
                    }

                    for (var index_destroy in to_destroy_ids) {
                        const state_id = to_destroy_ids[index_destroy];
                        if (widget.state.id === state_id) {
                            to_destroy.push(widget);
                            break;
                        }
                    }
                }

                return to_destroy;
            },

            /**
             * We need check current states to ensure that doesn't exists duplications,
             * update the existing and add the new ones.
             *
             * @private
             * @returns {Array}
             */
            _processCurrentStates: function(old_states) {
                var to_destroy = this._processStatesToDestroy(old_states);
                // Records to Update or Create
                var model = this.getParent().getBasicFieldParams().model;
                var to_add = [];
                for (var index in this.state.data) {
                    var state = this.state.data[index];
                    if (!this._isValidLineState(state)) {
                        continue;
                    }
                    var exists = false;
                    var search_record_index = false;
                    var search_record = false;
                    for (var widget of this.widgets) {
                        if (!widget) {
                            // Already processed widget (deleted)
                            continue;
                        }

                        var record = model.get(widget.state.id);
                        // Re-use widgets is possible
                        var is_to_destroy = _.findIndex(to_destroy, widget) >= 0;
                        var is_widget_usable =
                            widget.state.id === state.id || widget.recordSearch.id ===
                            state.data[this.options.field_map.product].data.id;
                        if (is_widget_usable) {
                            if (is_to_destroy) {
                                to_destroy = _.without(to_destroy, widget);
                            }
                            if (record) {
                                model.updateRecordContext(state.id, {
                                    lazy_qty: record.context.lazy_qty || 0,
                                    saving: record.context.saving || false,
                                    need_notify: record.context.need_notify || false,
                                    need_save: record.context.need_save || false,
                                });
                            }
                            // Ensure use the updated state
                            widget.recreate(state);
                            exists = true;
                            break;
                        } else if (
                            widget.state &&
                            !model.isPureVirtual(widget.state.id) &&
                            widget.recordSearch.id ===
                                state.data[this.options.field_map.product].data.id
                        ) {
                            search_record = widget.recordSearch;
                            const in_search_records = _.some(
                                this.search_records,
                                function(item) {
                                    return item.id === search_record.id;
                                }
                            );
                            if (in_search_records) {
                                // Is a new record (can be other record for the same 'search record')
                                search_record_index = widget.state.id;
                            }
                        }
                    }

                    // Add to create the new record
                    if (!exists && search_record_index) {
                        var new_search_record = _.extend({}, search_record, {
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
                return [to_add.reverse(), to_destroy];
            },

            /**
             * This method checks and appends the missing
             * 'pure virtual' records
             *
             * @returns {Deferred}
             */
            checkVirtualRecords: function() {
                if (this.search_group.name === "main_lines") {
                    return $.when();
                }
                var tasks = [];
                var to_add = this._processVirtualRecords();
                for (var params of to_add) {
                    tasks.push(this.appendSearchRecords.apply(this, params)[0]);
                }
                return $.when(tasks);
            },

            /**
             * This method checks the current widgets to generate the
             * missing 'pure virtual' record objects.
             *
             * @returns {Array}
             */
            _processVirtualRecords: function() {
                var model = this.getParent().getBasicFieldParams().model;
                var products_done = [];
                var to_add = [];
                for (var search_record of this.search_records) {
                    var widgets = this.getWidgetsByProduct(search_record.id);
                    if (_.isEmpty(widgets)) {
                        to_add.push([
                            [_.omit(search_record, "__id")],
                            {
                                no_attach_widgets: true,
                                no_process_records: true,
                            },
                        ]);
                        continue;
                    }

                    // Only add 'pure virtual' records if don't have a line
                    var existing_widgets = _.filter(widgets, function(widget) {
                        return !widget.isMarkedToDestroy();
                    });
                    var need_virtual = !_.some(existing_widgets, function(widget) {
                        return widget.state && !model.isPureVirtual(widget.state.id);
                    });
                    if (
                        need_virtual &&
                        products_done.indexOf(search_record.id) === -1
                    ) {
                        var has_virtual = _.some(existing_widgets, function(widget) {
                            return (
                                !widget.state ||
                                (widget.state && model.isPureVirtual(widget.state.id))
                            );
                        });
                        if (!has_virtual) {
                            var search_record_index = _.max(widgets, function(widget) {
                                return widget.$el.index();
                            }).state.id;
                            to_add.push([
                                [_.omit(search_record, "__id")],
                                {
                                    no_attach_widgets: true,
                                    no_process_records: true,
                                    position: search_record_index,
                                },
                            ]);
                            products_done.push(search_record.id);
                        }
                    }
                }
                return to_add;
            },

            /**
             * When the state change this method tries to update current records, delete
             * or update them.
             * Thanks to this we don't need re-render 'pure virtual' records.
             * NOTE: The first load of the records don't trigger this method.
             *
             * @private
             * @param {Object} old_states
             * @returns {Deferred}
             */
            _updateStateRecords: function(old_states) {
                var self = this;
                var record_defs = this._processCurrentStates(old_states);
                var to_add_current = record_defs[0];
                var to_destroy = record_defs[1];
                _.invoke(to_destroy, "markToDestroy");
                var currentTasks = [];
                for (var params of to_add_current) {
                    currentTasks.push(this.appendSearchRecords.apply(this, params)[0]);
                }

                return $.when(currentTasks)
                    .then(function() {
                        return self.checkVirtualRecords();
                    })
                    .then(function() {
                        var widgets_to_destroy = _.filter(self.widgets, function(
                            widget
                        ) {
                            return widget.isMarkedToDestroy();
                        });
                        self.widgets = _.difference(self.widgets, widgets_to_destroy);
                        _.invoke(widgets_to_destroy, "destroy");
                        return true;
                    });
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
                    var field_name = this.options.field_map.product;
                    for (var index_datas in datas) {
                        var data = datas[index_datas];

                        for (var index_state in this.state.data) {
                            var state_data = this.state.data[index_state];
                            if (
                                this._isValidLineState(state_data) &&
                                state_data.data[field_name].res_id === data.id
                            ) {
                                data._order_value = state_data.res_id;
                            }
                        }
                    }
                    var sorted_datas = _.chain(datas)
                        .sortBy("_order_value")
                        .map(function(item) {
                            return _.omit(item, "_order_value");
                        })
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
                var model = this.getParent().getBasicFieldParams().model;
                var field_name = this.options.field_map.product;
                var records = [];
                var states = [];

                var test_values = function(field_value, record_search) {
                    return (
                        (typeof field_value === "object" &&
                            field_value.data.id === record_search.id) ||
                        field_value === record_search.id
                    );
                };

                for (var index in results) {
                    var record_search = results[index];

                    var widget_created = false;

                    for (var index_data in this.state.data) {
                        var state_record = this.state.data[index_data];
                        var field_value = state_record.data[field_name];
                        if (
                            !this._isValidLineState(state_record) ||
                            !test_values(field_value, record_search)
                        ) {
                            continue;
                        }
                        widget_created = true;
                        // At this point the result has a state (line)
                        // Search if already exists a widget using the state
                        var widget = _.find(this.widgets, function(widget) {
                            return (
                                !widget.isMarkedToDestroy() &&
                                widget.state &&
                                widget.state.id === state_record.id
                            );
                        });
                        if (widget) {
                            // Don't need create a new widget (record)
                            states.push(widget.state);
                        } else {
                            // Need create a new widget linked with the state
                            records.push(
                                _.extend({}, record_search, {
                                    __id: state_record.id,
                                })
                            );
                            states.push(state_record);
                        }
                    }
                    if (widget_created) {
                        continue;
                    }

                    var widgets = this.getWidgetsByProduct(record_search.id);
                    // Only can exists 'pure virtual' if no 'lines' assigned
                    if (_.isEmpty(widgets)) {
                        var has_virtual = _.some(widgets, function(widget) {
                            return (
                                !widget.isMarkedToDestroy() &&
                                (!widget.state ||
                                    (widget.state &&
                                        model.isPureVirtual(widget.state.id)))
                            );
                        });
                        if (!has_virtual) {
                            // The result need a 'pure virtual' record
                            records.push(_.omit(record_search, "__id"));
                        }
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
             * @returns {Array}
             */
            _appendSearchRecords: function(search_records, options) {
                var self = this;
                var processed_info =
                    !options.no_process_records &&
                    this._processSearchRecords(search_records);
                var records_to_add =
                    (processed_info && processed_info.records) || search_records;
                _.each(records_to_add, function(search_record) {
                    // Get record state (if can)
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
                        var defVirtualState = ProductPickerRecord.generateVirtualState({
                            onchange_delay: self.options.instant_search
                                ? self._instant_search_onchange_delay
                                : 0,
                        });
                        self.defsVirtualState.push(defVirtualState);
                    }

                    // At this point the widget will use the existing state (line) or
                    // a simple state data. Using simple state data instead of waiting for
                    // complete state (default + onchange) gives a low FCP time.
                    var def = ProductPickerRecord.appendTo(self.$recordsContainer).then(
                        function(widget, widget_position) {
                            if (typeof widget_position !== "undefined") {
                                var $elm = self.$el.find(
                                    `[data-card-id="${widget_position}"]:first`
                                );
                                widget.$el.insertAfter($elm);
                            }
                        }.bind(self, ProductPickerRecord, options.position)
                    );
                    self.defs.push(def);
                });

                return records_to_add;
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
                var self = this;
                if (options.clear) {
                    this.clearRecords();
                }
                this.trigger_up("loading_records");
                this.defs = [];
                this.defsVirtualState = [];
                var cur_widget_index = this.widgets.length;
                this._appendSearchRecords(search_records, options);

                var defs = this.defs;
                delete this.defs;
                var defsVirtualState = this.defsVirtualState;
                delete this.defsVirtualState;
                return [
                    $.when(defs).then(function() {
                        if (!options.no_attach_widgets && self._isInDom) {
                            var new_widgets = self.widgets.slice(cur_widget_index);
                            _.invoke(new_widgets, "on_attach_callback");
                        }
                        // Destroy unused
                        if (options.cleanup) {
                            self.search_records = _.compact(search_records);
                            var widgets_to_destroy = _.filter(self.widgets, function(
                                widget
                            ) {
                                return (
                                    widget.isMarkedToDestroy() ||
                                    !_.some(self.search_records, function(
                                        search_record
                                    ) {
                                        return (
                                            search_record.id ===
                                                widget.recordSearch.id &&
                                            !_.some(self.widgets, function(
                                                comp_widget
                                            ) {
                                                return (
                                                    comp_widget !== widget &&
                                                    comp_widget.state &&
                                                    comp_widget.recordSearch.id ===
                                                        widget.recordSearch.id
                                                );
                                            })
                                        );
                                    })
                                );
                            });
                            _.invoke(widgets_to_destroy, "destroy");
                            self.widgets = _.difference(
                                self.widgets,
                                widgets_to_destroy
                            );
                        } else {
                            self.search_records = self.search_records || [];
                            for (var search_record of search_records) {
                                var has_search_record = _.some(
                                    self.search_records,
                                    function(item) {
                                        return (
                                            item.id === search_record.id &&
                                            item.__id === search_record.__id
                                        );
                                    }
                                );
                                if (!has_search_record) {
                                    self.search_records.push(search_record);
                                }
                            }
                        }
                        return true;
                    }),
                    $.when(defsVirtualState).then(function() {
                        self.trigger_up("loading_records", {finished: true});
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
                var widget = this.widgets[index];
                var $actived_card = this.$el.find(".active");
                if (widget.$card.hasClass("active")) {
                    widget.$card.removeClass("active");
                    widget.$card.find(".oe_flip_card_front").removeClass("d-none");
                } else {
                    widget.defs = [];
                    widget._processWidgetFields(widget.$back);
                    widget._processWidgets(widget.$back);
                    widget._processDynamicFields();
                    $.when(widget.defs).then(function() {
                        $actived_card.removeClass("active");
                        $actived_card.find(".oe_flip_card_front").removeClass("d-none");
                        widget.$card.addClass("active");
                        setTimeout(function() {
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
                var prev_widget_index = evt.data.prev_widget_index;
                if (
                    typeof prev_widget_index !== "undefined" &&
                    this.widgets[prev_widget_index]
                ) {
                    // Only check 'back' widgets so there is where the form was created
                    for (var index in this.widgets[prev_widget_index].widgets.back) {
                        var widget = this.widgets[prev_widget_index].widgets.back[
                            index
                        ];
                        if (
                            widget.controller &&
                            widget.className ===
                            "oe_one2many_product_picker_quick_create"
                        ) {
                            widget.controller.auto();
                        }
                    }
                    this.widgets[prev_widget_index].recreate();
                }
            },
        });

        return One2ManyProductPickerRenderer;
    }
);
