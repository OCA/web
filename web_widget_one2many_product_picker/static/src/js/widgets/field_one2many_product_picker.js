// Copyright 2020 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define("web_widget_one2many_product_picker.FieldOne2ManyProductPicker", function(
    require
) {
    "use strict";

    const core = require("web.core");
    const field_registry = require("web.field_registry");
    const FieldOne2Many = require("web.relational_fields").FieldOne2Many;
    const One2ManyProductPickerRenderer = require("web_widget_one2many_product_picker.One2ManyProductPickerRenderer");
    const tools = require("web_widget_one2many_product_picker.tools");

    const _t = core._t;
    const qweb = core.qweb;

    /* This is the main widget */
    const FieldOne2ManyProductPicker = FieldOne2Many.extend({
        className: "oe_field_one2many_product_picker",

        // Workaround: We need know all records,
        // the widget pagination works with product.product.
        limit: 9999999,

        events: _.extend({}, FieldOne2Many.prototype.events, {
            "click .dropdown-item": "_onClickSearchMode",
            "click .oe_btn_lines": "_onClickLines",
            "click .oe_btn_search_group": "_onClickSearchGroup",
            "search .oe_search_input": "_onSearch",
            "input .oe_search_input": "_onInputSearch",
            "focusin .oe_search_input": "_onFocusInSearch",
            "show.bs.dropdown .o_cp_buttons": "_onShowSearchDropdown",
            "click #product_picker_maximize": "_onClickMaximize",
        }),
        custom_events: _.extend({}, FieldOne2Many.prototype.custom_events, {
            create_quick_record: "_onCreateQuickRecord",
            update_quick_record: "_onUpdateQuickRecord",
            update_subtotal: "_onUpdateSubtotal",
            load_more: "_onLoadMore",
            loading_records: "_onLoadingRecords",
            list_record_remove: "_onListRecordRemove",
        }),

        _auto_search_delay: 450,
        _input_instant_search_time: 100,

        // Model product.product fields
        search_read_fields: ["id", "display_name", "uom_id"],

        /**
         * @override
         */
        init: function(parent) {
            this._super.apply(this, arguments);

            // Use jquery 'extend' to have a 'deep' merge.
            this.options = $.extend(
                true,
                this._getDefaultOptions(),
                this.attrs.options
            );
            if (!this.options.search) {
                // Default search domain
                this.options.search = [
                    {
                        name: _t("By Name"),
                        domain: [],
                        name_search_value: "$search",
                    },
                ];
            }
            this._searchMode = 0;
            this._searchCategoryNames = _.map(this.options.search, "name");
            this._searchContext = {};

            // FIXME: Choose a better way to get the active controller or model objects
            this.parent_controller = parent.getParent();
            if (this.view) {
                this._processGroups();
            }

            this._currentSearchBatchID = 0;

            this._lazyRenderSearchRecords = _.debounce(() => {
                this.doRenderSearchRecords();
                ++this._currentSearchBatchID;
            }, this._input_instant_search_time);
        },

        willStart: function() {
            return this._super
                .apply(this, arguments)
                .then(() => {
                    const arch = this.view.arch;
                    const field_name = this.options.field_map.product;
                    const field_info = this.view.fieldsInfo[arch.tag][field_name];
                    const model = this.view.viewFields[field_info.name].relation;
                    this._modelName = model;
                    return this.parent_controller.model.fetchModelFieldsInfo(model);
                })
                .then(fields_info => {
                    this._fieldsInfo = fields_info;
                    if (this.isReadonly) {
                        // Show Lines
                        this._updateSearchContext(-1);
                    } else {
                        this._updateSearchContext(0);
                    }
                });
        },

        /**
         * Updates the lines counter badge
         */
        updateBadgeLines: function() {
            const records = this.parent_controller.model.get(this.record.id).data[
                this.name
            ].data;
            this.$badgeLines.text(records.length);
        },

        updateSubtotalPrice: function() {
            if (!this.options.show_subtotal) {
                return;
            }
            let prices = [];
            const field_map = this.options.field_map;
            const records = this.parent_controller.model.get(this.record.id).data[
                this.name
            ].data;
            if (this.options.show_discount) {
                prices = _.map(records, line => {
                    return (
                        line.data[field_map.product_uom_qty] *
                        tools.priceReduce(
                            line.data[field_map.price_unit],
                            line.data[field_map.discount]
                        )
                    );
                });
            } else {
                prices = _.map(records, line => {
                    return (
                        line.data[field_map.product_uom_qty] *
                        line.data[field_map.price_unit]
                    );
                });
            }
            let total =
                _.reduce(prices, (a, b) => {
                    return a + b;
                }) || 0;
            total = tools.monetary(
                total,
                this.value.fields[this.options.field_map.price_unit],
                this.options.currency_field,
                this.record.data
            );
            this.$totalZone.find(".total_price").html(total || 0.0);
        },

        /**
         * Helper to constucts a dictionary with essential values
         * used by the involved views.
         *
         * @returns {Object}
         */
        getBasicFieldParams: function() {
            return {
                domain: this.record.getDomain(this.recordParams),
                field: this.field,
                parentID: this.value.id,
                record: this.record,
                model: this.parent_controller.model,
                fieldName: this.name,
                recordData: this.recordData,
                value: this.value,
                relation_field: this.record.fields[this.name].relation_field,
                current_batch_id: this._currentSearchBatchID,
            };
        },

        /**
         * Because the widget shows "pure virtual" information, we don't have any 'onchange' linked.
         * This method forces 'refresh' the widget if the selected fields was changed.
         *
         * @param {Array} fields
         * @param {Event} e
         */
        onDocumentConfirmChanges: function(fields, e) {
            const trigger_fields = this.options.trigger_refresh_fields || [];
            if (_.difference(trigger_fields, fields).length !== trigger_fields.length) {
                this._reset(
                    this.parent_controller.model.get(this.parent_controller.handle),
                    e
                );
                // Force re-launch onchanges on 'pure virtual' records
                this.renderer.clearRecords();
                this._render();
            }
        },

        /**
         * @override
         */
        _getRenderer: function() {
            return One2ManyProductPickerRenderer;
        },

        /**
         * Create the group buttons defined in options
         *
         * @private
         */
        _processGroups: function() {
            this.searchGroups = [];
            let hasUserActive = false;
            const groups = this.options.groups || [];
            for (const groupIndex in groups) {
                const group_def = groups[groupIndex];
                if (group_def.active) {
                    group_def.active = !hasUserActive;
                    hasUserActive = true;
                }
                if (!group_def.records_per_page) {
                    group_def.records_per_page = 16;
                }
                this.searchGroups.push(group_def);
            }

            this.searchGroups.splice(0, 0, {
                name: "all",
                string: _t("All"),
                domain: this.options.all_domain,
                order: false,
                active: !hasUserActive,
                records_per_page: 16,
            });
            this._activeSearchGroup = this.searchGroups[0];
        },

        /**
         * Inject widget buttons and ignore default pagination to use
         * we own implementation.
         *
         * @override
         */
        _renderControlPanel: function() {
            return this._super.apply(this, arguments).then(() => {
                this._controlPanel.updateContents({
                    cp_content: {
                        $buttons: this.$buttons,
                        $pager: false,
                    },
                });
            });
        },

        /**
         * @override
         */
        _renderButtons: function() {
            if (this.isReadonly) {
                return this._super.apply(this, arguments);
            }
            this.$buttons = $(
                qweb.render("One2ManyProductPicker.ControlPanelButtons", {
                    search_category_names: this._searchCategoryNames,
                    search_mode: this._searchMode,
                })
            );
            this.$searchInput = this.$buttons.find(".oe_search_input");
            this.$groups = $(
                qweb.render("One2ManyProductPicker.ControlPanelGroupButtons", {
                    groups: this.searchGroups,
                })
            );
            this.$btnLines = this.$groups.find(".oe_btn_lines");
            this.$badgeLines = this.$btnLines.find(".badge");
            this.updateBadgeLines();
            this.$groups.appendTo(this.$buttons);
        },

        /**
         * @override
         */
        _render: function() {
            const def = this._super.apply(this, arguments);
            if (def) {
                this.renderer.updateSearchGroup(this._activeSearchGroup);

                // Check maximize state
                if (!this.$el.hasClass("oe_field_one2many_product_picker_maximized")) {
                    this.$el.addClass("position-relative d-flex flex-column");
                }

                return new Promise(resolve => {
                    this._getSearchRecords()
                        .then(records => {
                            return this.renderer.appendSearchRecords(records, {
                                cleanup: false,
                            });
                        })
                        .then(() => resolve());
                }).then(() => {
                    if (this.options.show_subtotal) {
                        this._addTotalsZone();
                    }
                });
            }

            return def;
        },

        /**
         * @returns {Deferred}
         */
        doRenderSearchRecords: function() {
            return new Promise(resolve => {
                this._getSearchRecords()
                    .then(records => {
                        this.renderer.$el.scrollTop(0);
                        return this.renderer.appendSearchRecords(records, {
                            cleanup: true,
                        });
                    })
                    .then(() => resolve());
            });
        },

        /**
         * Inject the 'maximize' button
         *
         * @private
         */
        _addTotalsZone: function() {
            this.$("#product_picker_total").remove();
            this.$totalZone = $(qweb.render("One2ManyProductPicker.Total"));
            this.$totalZone.appendTo(this.$el);
            this.updateSubtotalPrice();
        },

        /**
         * Replace placeholders for search
         *   - $number_search -> Is a number
         *   - $search -> Is a string
         *
         * @private
         * @param {Number/String} value
         * @param {String} format
         * @returns {Number/String}
         */
        _getSearchValue: function(value, format) {
            if (format === "$number_search") {
                return Number(value);
            } else if (typeof value === "string") {
                return format.replace(/\$search/, value);
            }
            return value;
        },

        /**
         * Obtain the linked records defined in the options.
         * If merge is true the current records aren't removed.
         *
         * @private
         * @param {Dictionary} options
         * @returns {Deferred}
         */
        _getSearchRecords: function(options) {
            const search_mode = this.options.search[this._searchMode];
            const orderby = this._searchContext.order;
            const fields = this.search_read_fields;

            // Launch the rpc request and ensures that we wait for the reply
            // to continue
            const domain = this._getFullSearchDomain(search_mode);
            const soptions = options || {};
            const context = _.extend(
                {
                    active_search_group_name: this._activeSearchGroup.name,
                    active_search_involved_fields: this._searchContext.involvedFields,
                    active_test: this._searchContext.activeTest,
                },
                this.value.getContext()
            );
            const limit = soptions.limit || this._activeSearchGroup.records_per_page;
            const offset = soptions.offset || 0;

            return new Promise(resolve => {
                let task = false;
                if (search_mode.name_search_value) {
                    const search_val = this._getSearchValue(
                        this._searchContext.text,
                        search_mode.name_search_value
                    );
                    const operator = search_mode.operator;
                    task = this.parent_controller.model.fetchNameSearchFull(
                        this._fieldsInfo,
                        this._modelName,
                        search_val,
                        domain,
                        fields,
                        orderby,
                        operator,
                        limit,
                        offset,
                        context
                    );
                } else {
                    task = this.parent_controller.model.fetchGenericRecords(
                        this._fieldsInfo,
                        this._modelName,
                        domain,
                        fields,
                        orderby,
                        limit,
                        offset,
                        context
                    );
                }

                task.then(results => {
                    this._searchOffset = offset + limit;
                    this.renderer.showLoadMore(limit && results.length === limit);
                    resolve(results);
                });
            });
        },

        /**
         * @private
         * @param {MouseEvent} evt
         */
        _onClickSearchGroup: function(evt) {
            const $btn = $(evt.target);
            const groupIndex = Number($btn.data("group")) || 0;
            this.showGroup(groupIndex);
            $btn.parent()
                .find(".active")
                .removeClass("active");
            $btn.addClass("active");
        },

        /**
         * @private
         */
        _onClickMaximize: function() {
            this.$el.toggleClass(
                "position-relative h-100 bg-white oe_field_one2many_product_picker_maximized"
            );
            if (this.$buttons) {
                this.$buttons.find(".dropdown-toggle").popover("update");
            }
        },

        /**
         * @private
         */
        _onClickLines: function() {
            this.showLines();
        },

        /**
         * @private
         * @param {MouseEvent} ev
         */
        _onClickSearchMode: function(ev) {
            ev.preventDefault();
            const $target = $(ev.target);
            this._searchMode = $target.index();
            $target
                .parent()
                .children()
                .removeClass("active");
            $target.addClass("active");
            this.doRenderSearchRecords().then(() => {
                this.$searchInput.focus();
            });
        },

        /**
         * @private
         * @returns {Object}
         */
        _getDefaultOptions: function() {
            return {
                currency_field: "currency_id",
                show_subtotal: true,
                show_discount: false,
                edit_discount: false,
                edit_price: true,
                field_map: {
                    name: "name",
                    product: "product_id",
                    product_uom: "product_uom",
                    product_uom_qty: "product_uom_qty",
                    price_unit: "price_unit",
                    discount: "discount",
                },
                trigger_refresh_fields: ["partner_id", "currency_id"],
                auto_save: false,
                ignore_warning: false,
                all_domain: [],
                instant_search: false,
            };
        },

        /**
         * Mix context search domain and user input search.
         * This domain is used to get the records to display.
         *
         * @private
         * @param {Object} search_mode
         * @returns {Array}
         */
        _getFullSearchDomain: function(search_mode) {
            this._searchContext.involvedFields = [];
            const domain = _.clone(this._searchContext.domain) || [];
            if (this._searchContext.text) {
                const search_domain = search_mode.domain;
                const involved_fields = [];

                // Iterate domain triplets and logic operators
                for (const index in search_domain) {
                    const domain_cloned = _.clone(search_domain[index]);

                    // Is a triplet
                    if (domain_cloned instanceof Array) {
                        // Replace right leaf with the current value of the search input
                        domain_cloned[2] = this._getSearchValue(
                            domain_cloned[2],
                            this._searchContext.text
                        );
                        involved_fields.push({
                            type: "number",
                            field: domain_cloned[0],
                            oper: domain_cloned[1],
                        });
                    }
                    domain.push(domain_cloned);
                }
                this._searchContext.involvedFields = involved_fields;
            }

            return domain || [];
        },

        /**
         * Domain to get the related records of the lines.
         *
         * @private
         * @returns {Array}
         */
        _getLinesDomain: function() {
            if (!this.view) {
                return [];
            }
            const field_name = this.options.field_map.product;
            const lines = this.parent_controller.model.get(this.record.id).data[
                this.name
            ].data;
            // Here only get lines with product_id assigned
            // This happens beacuse sale.order has lines for sections/comments
            const ids = _.chain(lines)
                .filter(line => line.data[field_name] !== false)
                .map(line => {
                    return line.data[field_name].data.id;
                })
                .value();
            return [["id", "in", ids]];
        },

        /**
         * @param {Number} group_id
         */
        _updateSearchContext: function(group_id) {
            if (group_id >= 0) {
                this._activeSearchGroup = this.searchGroups[group_id];
                this._searchContext.domain = this._activeSearchGroup.domain;
                this._searchContext.order = this._activeSearchGroup.order;
                this._searchContext.activeTest = this._activeSearchGroup.active_test;
            } else {
                this._activeSearchGroup = {
                    name: "main_lines",
                };
                this._searchContext.domain = this._getLinesDomain();
                this._searchContext.order = [{name: "sequence"}, {name: "id"}];
                this._searchContext.activeTest = false;
            }
            if (this.renderer) {
                this.renderer.updateSearchGroup(this._activeSearchGroup);
            }
        },

        /**
         * The lines are special data, so we need display it in a other way
         * that the search results. Use directy in-memory values.
         */
        showLines: function() {
            this.renderer.clearRecords();
            this._updateSearchContext(-1);
            this._clearSearchInput();
            this.$btnLines
                .parent()
                .find(".active")
                .removeClass("active");
            this.$btnLines.addClass("active");
            this.doRenderSearchRecords();
        },

        /**
         * @param {Number} group_id
         */
        showGroup: function(group_id) {
            this.renderer.clearRecords();
            this._updateSearchContext(group_id);
            this.doRenderSearchRecords();
            this.$btnLines.removeClass("active");
        },

        /**
         * @private
         */
        _clearSearchInput: function() {
            if (this.$searchInput) {
                this.$searchInput.val("");
                this._searchContext.text = "";
            }
        },

        /**
         * Odoo stop bubble of the event, but we need listen it.
         *
         * @override
         */
        _onKeydown: function(evt) {
            if (evt.keyCode === $.ui.keyCode.ENTER) {
                // Do nothing
                return;
            }
            return this._super.apply(this, arguments);
        },

        /**
         * @private
         * @param {SearchEvent} evt
         */
        _onSearch: function(evt) {
            this._searchContext.text = evt.target.value;
            this.doRenderSearchRecords();
        },

        /**
         * @private
         * @param {InputEvent} evt
         */
        _onInputSearch: function(evt) {
            if (this.options.instant_search) {
                this._searchContext.text = evt.target.value;
                this._lazyRenderSearchRecords();
            }
        },

        /**
         * Auto select all content when user enters into fields with this
         * widget.
         *
         * @private
         */
        _onFocusInSearch: function() {
            // Workaround: In some cases the focus it's not properly
            // assigned due an "event collision".
            // Use deferred call to ensure dispatch our event in
            // a new frame.
            _.defer(() => this.$searchInput.select());
        },

        /**
         * @private
         * @param {DropdownEvent} evt
         */
        _onShowSearchDropdown: function(evt) {
            // Workaround: This "ensures" a correct dropdown position
            const offset = $(evt.currentTarget)
                .find(".dropdown-toggle")
                .parent()
                .height();
            _.defer(() => {
                $(evt.currentTarget)
                    .find(".dropdown-menu")
                    .css("transform", "translate3d(0px, " + offset + "px, 0px)");
            });
        },

        /**
         * Runs the x2many (4,id,0) command.
         *
         * @private
         * @param {CustomEvent} evt
         */
        _onCreateQuickRecord: function(evt) {
            evt.stopPropagation();
            var model = this.parent_controller.model;
            model.setPureVirtual(evt.data.id, false);

            if (this.options.auto_save) {
                // Dont trigger state update
                this._setValue(
                    {operation: "ADD", id: evt.data.id},
                    {notifyChange: false}
                ).then(() => {
                    this.parent_controller
                        .saveRecord(undefined, {stayInEdit: true})
                        .then(() => {
                            self.renderer.updateState(
                                model.get(self.parent_controller.handle).data[
                                    self.name
                                ],
                                {force: true}
                            );
                            if (evt.data.callback) {
                                evt.data.callback();
                            }
                        });
                    if (evt.data.callback) {
                        evt.data.callback();
                    }
                });
            } else {
                // This will trigger an "state" update
                this._setValue({operation: "ADD", id: evt.data.id}).then(() => {
                    if (evt.data.callback) {
                        evt.data.callback();
                    }
                });
            }
        },

        /**
         * @param {Number} id
         * @param {Object} data
         * @param {Function} callback
         */
        _doUpdateQuickRecord: function(id, data, callback) {
            if (this.options.auto_save) {
                var self = this;
                // Dont trigger state update
                this._setValue(
                    {operation: "UPDATE", id: id, data: data},
                    {notifyChange: false}
                ).then(function() {
                    self.parent_controller
                        .saveRecord(undefined, {stayInEdit: true})
                        .then(function() {
                            self.renderer.updateState(
                                self.parent_controller.model.get(
                                    self.parent_controller.handle
                                ).data[self.name],
                                {force: true}
                            );
                            if (callback) {
                                callback();
                            }
                        });
                    if (callback) {
                        callback();
                    }
                });
            } else {
                // This will trigger an "state" update
                this._setValue({operation: "UPDATE", id: id, data: data}).then(
                    function() {
                        if (callback) {
                            callback();
                        }
                    }
                );
            }
        },

        /**
         * Runs the x2many (1,id,values) command.
         *
         * @private
         * @param {CustomEevent} evt
         */
        _onUpdateQuickRecord: function(evt) {
            evt.stopPropagation();
            this._doUpdateQuickRecord(evt.data.id, evt.data.data, evt.data.callback);
        },

        /**
         * Handle auto_save when remove a record
         *
         * @param {CustomEvent} evt
         */
        _onListRecordRemove: function(evt) {
            evt.stopPropagation();
            this._setValue({operation: "DELETE", ids: [evt.data.id]}).then(() => {
                if (this.options.auto_save) {
                    this.parent_controller
                        .saveRecord(undefined, {stayInEdit: true})
                        .then(() => {
                            if (evt.data.callback) {
                                evt.data.callback();
                            }
                        });
                } else if (evt.data.callback) {
                    evt.data.callback();
                }
            });
        },

        /**
         * @private
         */
        _onUpdateSubtotal: function() {
            this.updateSubtotalPrice();
        },

        /**
         * Event dispatched by the 'scroll spy' to load
         * records.
         *
         * @private
         */
        _onLoadMore: function() {
            if (this._isLoading) {
                return;
            }
            this._getSearchRecords({
                offset: this._searchOffset,
            }).then(records => {
                this.renderer.appendSearchRecords(records);
            });
        },

        /**
         * @private
         * @param {CustomEvent} evt
         */
        _onLoadingRecords: function(evt) {
            this._isLoading = !evt.data.finished;
            this._blockControlPanel(this._isLoading);
            if (this.renderer) {
                this.renderer.blockLoadMore(this._isLoading);
            }
        },

        /**
         * @private
         * @param {Boolean} block
         */
        _blockControlPanel: function(block) {
            if (this.$buttons) {
                this.$buttons.find("button").attr("disabled", block);
            }
        },

        /**
         * Refresh lines count on every change.
         *
         * @override
         */
        _setValue: function() {
            return this._super.apply(this, arguments).then(() => {
                this.updateBadgeLines();
                this.updateSubtotalPrice();
            });
        },
    });

    field_registry.add("one2many_product_picker", FieldOne2ManyProductPicker);

    return FieldOne2ManyProductPicker;
});
