// Copyright 2020 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define("web_widget_one2many_product_picker.FieldOne2ManyProductPicker", function(
    require
) {
    "use strict";

    var core = require("web.core");
    var field_registry = require("web.field_registry");
    var FieldOne2Many = require("web.relational_fields").FieldOne2Many;
    var One2ManyProductPickerRenderer = require("web_widget_one2many_product_picker.One2ManyProductPickerRenderer");
    var tools = require("web_widget_one2many_product_picker.tools");

    var _t = core._t;
    var qweb = core.qweb;

    /* This is the main widget */
    var FieldOne2ManyProductPicker = FieldOne2Many.extend({
        className: "oe_field_one2many_product_picker",

        // Workaround: We need know all records,
        // the widget pagination works with product.product.
        limit: 9999999,

        events: _.extend({}, FieldOne2Many.prototype.events, {
            "click .dropdown-item": "_onClickSearchMode",
            "click .oe_btn_lines": "_onClickLines",
            "click .oe_btn_search_group": "_onClickSearchGroup",
            "keypress .oe_search_input": "_onKeyPressSearch",
            "input .oe_search_input": "_onInputSearch",
            "focusin .oe_search_input": "_onFocusInSearch",
            "focusout .oe_search_input": "_onFocusOutSearch",
            "show.bs.dropdown .o_cp_buttons": "_onShowSearchDropdown",
            "click #product_picker_maximize": "_onClickMaximize",
            "click #product_picker_clear_input": "_onClickClearInput",
        }),
        custom_events: _.extend({}, FieldOne2Many.prototype.custom_events, {
            create_quick_record: "_onCreateQuickRecord",
            update_quick_record: "_onUpdateQuickRecord",
            modify_quick_record: "_onModifyQuickRecord",
            update_subtotal: "_onUpdateSubtotal",
            load_more: "_onLoadMore",
            loading_records: "_onLoadingRecords",
            list_record_remove: "_onListRecordRemove",
            pause_auto_save: "_onPauseAutoSave",
            resume_auto_save: "_onResumeAutoSave",
        }),

        _auto_search_delay: 450,
        _input_instant_search_time: 100,

        // Product.product model fields
        search_read_fields: ["id", "display_name", "uom_id"],

        /**
         * @override
         */
        init: function(parent) {
            var self = this;
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
            this._saveChain = $.Deferred().resolve();

            this._lazyRenderSearchRecords = _.debounce(function() {
                self.doRenderSearchRecords({cleanup: true});
                ++self._currentSearchBatchID;
            }, this._input_instant_search_time);

            // Variables to control when launch save document
            this._auto_save_timeout = null; // Timer to launch save process
            this._ids_to_wait = []; // Records to wait before save
            this._ids_to_update = {}; // Records to update
            this._is_auto_save_paused = false;
            this._need_resume_auto_save = false;

            // Set a custom context to know that product picker is in use
            this.trigger_up("using_product_picker", {
                field: this.name,
                relation: this.field.relation,
                relation_field: this.field.relation_field,
                product_field: this.options.field_map.product,
            });
        },

        willStart: function() {
            var self = this;
            return this._super
                .apply(this, arguments)
                .then(function() {
                    var arch = self.view.arch;
                    var field_name = self.options.field_map.product;
                    var field_info = self.view.fieldsInfo[arch.tag][field_name];
                    var model = self.view.viewFields[field_info.name].relation;
                    self._modelName = model;
                    return self.parent_controller.model.fetchModelFieldsInfo(model);
                })
                .then(function(fields_info) {
                    self._fieldsInfo = fields_info;
                    if (self.isReadonly) {
                        // Show Lines
                        self._updateSearchContext(-1);
                    } else {
                        self._updateSearchContext(0);
                    }
                    self._searchContext.text = "";
                });
        },

        /**
         * @override
         */
        start: function() {
            var self = this;
            return this._super.apply(this, arguments).then(function() {
                self.$el.append(
                    "<div class='loading'>" + _("SAVING DOCUMENT...") + "</div>"
                );
            });
        },

        /**
         * @override
         */
        isValid: function () {
            let is_valid = this._super.apply(this, arguments);
            if (is_valid) {
                is_valid = this._ids_to_wait.length === 0;
            }
            return is_valid;
        },

        /**
         * Updates the lines counter badge
         */
        updateBadgeLines: function() {
            var records = this.parent_controller.model.get(this.record.id).data[
                this.name
            ].data;
            this.$badgeLines.text(records.length);
        },

        updateSubtotalPrice: function() {
            if (!this.options.show_subtotal) {
                return;
            }
            var prices = [];
            var field_map = this.options.field_map;
            var records = this.parent_controller.model.get(this.record.id).data[
                this.name
            ].data;
            if (this.options.show_discount) {
                prices = _.map(records, function(line) {
                    return (
                        line.data[field_map.product_uom_qty] *
                        tools.priceReduce(
                            line.data[field_map.price_unit],
                            line.data[field_map.discount]
                        )
                    );
                });
            } else {
                prices = _.map(records, function(line) {
                    return (
                        line.data[field_map.product_uom_qty] *
                        line.data[field_map.price_unit]
                    );
                });
            }
            var total =
                _.reduce(prices, function(a, b) {
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
                controller: this.parent_controller, // TODO: Use events!
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
            var trigger_fields = this.options.trigger_refresh_fields || [];
            if (_.difference(trigger_fields, fields).length !== trigger_fields.length) {
                this._reset(this.parent_controller.model.get(this.dataPointID), e);
                // Force re-launch onchanges on 'pure virtual' records
                this.renderer.clearRecords();
                this._render();
            }
        },

        /**
         * Product picker can be interactive during save process
         *
         * @param {Boolean} status
         */
        onDocumentSave: function(status) {
            this.$el.toggleClass("disabled", status);
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
            var hasUserActive = false;
            var groups = this.options.groups;
            for (var groupIndex in groups) {
                var group_def = groups[groupIndex];
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
            var self = this;
            return this._super.apply(this, arguments).then(() => {
                self.control_panel.update({
                    cp_content: {
                        $buttons: self.$buttons,
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
            var self = this;
            var def = this._super.apply(this, arguments);
            if (def) {
                this.$card_zone = this.$el.find(".oe_one2many_product_picker_view");
                this.renderer.updateSearchGroup(this._activeSearchGroup);

                // Check maximize state
                if (!this.$el.hasClass("oe_field_one2many_product_picker_maximized")) {
                    this.$el.addClass("position-relative d-flex flex-column");
                }

                return this.doRenderSearchRecords({
                    cleanup: false,
                }).then(function() {
                    if (self.options.show_subtotal) {
                        self._addTotalsZone();
                    }
                });
            }

            return def;
        },

        /**
         * @returns {Deferred}
         */
        doRenderSearchRecords: function(options) {
            options = options || {};
            var self = this;
            if (options.clear) {
                this.renderer.clearRecords();
            }
            this._onPauseAutoSave();
            return this._getSearchRecords().then(function(records) {
                self.renderer.$el.scrollTop(0);
                var defs = self.renderer.appendSearchRecords(records, options);
                if (options.cleanup) {
                    self._resetSaveTimeout();
                }
                return $.when(defs).then(function() {
                    self._onResumeAutoSave();
                });
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
            } else if (typeof format === "string") {
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
            var self = this;
            var search_mode = this.options.search[this._searchMode];
            var orderby = this._searchContext.order;
            var fields = this.search_read_fields;

            // Launch the rpc request and ensures that we wait for the reply
            // to continue
            var domain = this._getFullSearchDomain(search_mode);
            var soptions = options || {};
            var context = _.extend(
                {
                    active_search_group_name: this._activeSearchGroup.name,
                    active_search_involved_fields: this._searchContext.involvedFields,
                    active_test: this._searchContext.activeTest,
                },
                this.value.getContext()
            );
            var limit = soptions.limit || this._activeSearchGroup.records_per_page;
            var offset = soptions.offset || 0;

            var task = false;
            if (search_mode.name_search_value) {
                var search_val = this._getSearchValue(
                    this._searchContext.text,
                    search_mode.name_search_value
                );
                var operator = search_mode.operator;
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

            return task.then(function(results) {
                self._searchOffset = offset + limit;
                self.renderer.showLoadMore(limit && results.length === limit);
                return results;
            });
        },

        /**
         * @private
         * @param {MouseEvent} evt
         */
        _onClickSearchGroup: function(evt) {
            if (!this.renderer.canBeUpdated()) {
                return;
            }
            var $btn = $(evt.target);
            var groupIndex = Number($btn.data("group")) || 0;
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
        _onClickClearInput: function() {
            if (!this.renderer.canBeUpdated()) {
                return;
            }
            this._clearSearchInput();
            this.doRenderSearchRecords({clenaup: true});
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
            if (!this.renderer.canBeUpdated()) {
                return;
            }
            var self = this;
            ev.preventDefault();
            var $target = $(ev.target);
            this._searchMode = $target.index();
            $target
                .parent()
                .children()
                .removeClass("active");
            $target.addClass("active");
            this.doRenderSearchRecords({cleanup: true}).then(function() {
                if (self.options.auto_focus) {
                    self.$searchInput.focus();
                }
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
                groups: [],
                default_group: false,
                auto_focus: true,
                auto_save_delay: 1500,
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
            var domain = _.clone(this._searchContext.domain) || [];
            if (this._searchContext.text) {
                var search_domain = search_mode.domain;
                var involved_fields = [];

                // Iterate domain triplets and logic operators
                for (var index in search_domain) {
                    var domain_cloned = _.clone(search_domain[index]);

                    // Is a triplet
                    if (domain_cloned instanceof Array) {
                        // Replace right leaf with the current value of the search input
                        domain_cloned[2] = this._getSearchValue(
                            this._searchContext.text,
                            domain_cloned[2]
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
            var field_name = this.options.field_map.product;
            var lines = this.parent_controller.model.get(this.record.id).data[this.name]
                .data;
            // Here only get lines with product_id assigned
            // This happens beacuse sale.order has lines for sections/comments
            var ids = _.chain(lines)
                .filter(function(line) {
                    return line.data[field_name] !== false;
                })
                .map(function(line) {
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
            if (
                !this.renderer.canBeUpdated() ||
                this._activeSearchGroup.name === "main_lines"
            ) {
                return;
            }
            this._updateSearchContext(-1);
            this._clearSearchInput();
            this.$btnLines
                .parent()
                .find(".active")
                .removeClass("active");
            this.$btnLines.addClass("active");
            this.doRenderSearchRecords({clear: true});
        },

        /**
         * @param {Number} group_id
         */
        showGroup: function(group_id) {
            if (
                !this.renderer.canBeUpdated() ||
                (this.searchGroups[group_id] &&
                    this._activeSearchGroup.name === this.searchGroups[group_id].name)
            ) {
                return;
            }
            var need_clear = this._activeSearchGroup.name === "main_lines";
            this._updateSearchContext(group_id);
            this.doRenderSearchRecords({cleanup: true, clear: need_clear});
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
         * @param {KeyboardEvent} evt
         */
        _onKeyPressSearch: function(evt) {
            if (evt.keyCode === $.ui.keyCode.ENTER && this.renderer.canBeUpdated()) {
                var self = this;
                this._searchContext.text = evt.target.value;
                this.doRenderSearchRecords({cleanup: true}).then(function() {
                    if (self.options.auto_focus) {
                        self.$searchInput.focus();
                    }
                });
            }
        },

        /**
         * @private
         * @param {InputEvent} evt
         */
        _onInputSearch: function(evt) {
            if (this.options.instant_search && this.renderer.canBeUpdated()) {
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
            var self = this;
            // Workaround: In some cases the focus it's not properly
            // assigned due an "event collision".
            // Use deferred call to ensure dispatch our event in
            // a new frame.
            _.defer(function() {
                return self.$searchInput.select();
            });
            this._onPauseAutoSave();
        },

        /**
         * @private
         */
        _onFocusOutSearch: function() {
            this._onResumeAutoSave();
        },

        /**
         * @private
         * @param {DropdownEvent} evt
         */
        _onShowSearchDropdown: function(evt) {
            // Workaround: This "ensures" a correct dropdown position
            var offset = $(evt.currentTarget)
                .find(".dropdown-toggle")
                .parent()
                .height();
            _.defer(function() {
                $(evt.currentTarget)
                    .find(".dropdown-menu")
                    .css("transform", "translate3d(0px, " + offset + "px, 0px)");
            });
        },

        /**
         * @returns {Deferred}
         */
        _saveDocument: function(ids_to_update) {
            var widgets = this.renderer.getWidgetsWithoutOnchange();
            if (
                widgets === false ||
                !_.isEmpty(this._ids_to_wait) ||
                _.isEmpty(ids_to_update) ||
                !_.isEmpty(widgets)
            ) {
                return this._saveChain;
            }
            var self = this;
            var model = this.parent_controller.model;

            this._saveChain = this._saveChain.then(function() {
                self.$el.addClass("disabled");
                self.parent_controller._disableButtons();
                var keys = _.keys(ids_to_update);
                self._ids_to_update = _.omit(self._ids_to_update, keys);
                for (var key of keys) {
                    model.updateRecordContext(key, {
                        saving: true,
                        need_save: false,
                    });
                }
                // Undefined = controller handler
                return self.parent_controller
                    .saveRecord(undefined, {stayInEdit: true})
                    .then(function() {
                        var tasks = [];
                        for (var key of keys) {
                            model.updateRecordContext(key, {
                                saving: false,
                                modified: false,
                            });
                        }
                        var parent_record = model.get(self.parent_controller.handle);
                        return self.parent_controller.renderer
                            .confirmChange(parent_record, parent_record.id, [self.name])
                            .then(function() {
                                self.$el.removeClass("disabled");
                                self.parent_controller._enableButtons();
                                self._ids_to_wait = [];
                                // for (var key of keys) {
                                //     tasks.push(self._checkLazyQty(key));
                                // }
                                return $.when(tasks);
                            });
                    })
                    .then(function() {
                        self._auto_save_timeout = null;
                    });
            });
            return this._saveChain;
        },

        /**
         * Check if the new record need update the qty
         * This can happends because the user update the value during saving process
         *
         * @param {String} reference
         * @returns {Promise}
         */
        _checkLazyQty: function(reference) {
            var model = this.parent_controller.model;
            var field_map = this.options.field_map;
            var new_states = model.get(this.dataPointID).data[this.name].data;
            var new_state = false;
            var old_record = model.get(reference);
            if (_.isNumber(old_record.data.id)) {
                // It's a existing record
                new_state = _.find(new_states, function(item) {
                    return item.data && item.data.id === old_record.data.id;
                });
            } else {
                // It's a new record
                var last_index = _.findLastIndex(new_states, function(item) {
                    return (
                        item.data &&
                        item.data[field_map.product].data.id ===
                            old_record.data[field_map.product].data.id &&
                        item.data[field_map.product_uom].data.id ===
                            old_record.data[field_map.product_uom].data.id
                    );
                });
                if (last_index !== -1) {
                    new_state = new_states[last_index];
                }
            }
            if (_.isEmpty(new_state)) {
                return $.Deferred().resolve();
            }
            var lazy_qty = old_record.context.lazy_qty || 0;
            model.updateRecordContext(new_state.id, {
                lazy_qty: lazy_qty,
                saving: old_record.context.saving || false,
                need_notify: old_record.context.need_notify || false,
                need_save: old_record.context.need_save || false,
            });
            if (new_state.data[field_map.product_uom_qty] < lazy_qty) {
                const widget = this.renderer.getWidgetByStateId(new_state.id);
                if (widget) {
                    widget.$card.addClass("blocked");
                }
                return this._doUpdateQuickRecord(
                    new_state.id,
                    {
                        [field_map.product_uom_qty]: lazy_qty,
                    },
                    {
                        on_onchange: function() {
                            widget.$card.removeClass("blocked");
                        },
                    }
                );
            }
            return $.Deferred().resolve();
        },

        /**
         * Runs the x2many (4,id,0) command.
         *
         * @private
         * @param {CustomEvent} evt
         */
        _onCreateQuickRecord: function(evt) {
            var self = this;
            evt.stopPropagation();
            var model = this.parent_controller.model;
            var def = false;
            model.setPureVirtual(evt.data.id, false);
            model.updateRecordContext(evt.data.id, {need_notify: false});

            if (this.options.auto_save) {
                model.updateRecordContext(evt.data.id, {need_save: true});
                def = this._setValue(
                    {operation: "ADD", id: evt.data.id},
                    {notifyChange: true}
                ).then(function() {
                    if (evt.data.on_onchange) {
                        evt.data.on_onchange();
                    }
                    self._ids_to_wait = _.without(self._ids_to_wait, evt.data.id);
                    self._ids_to_update[evt.data.id] = {
                        on_autosave: evt.data.on_autosave,
                        on_autosaved: evt.data.on_autosaved,
                    };
                    if (_.isEmpty(self._ids_to_wait)) {
                        self._resetSaveTimeout(true);
                    }
                });
            } else {
                // This will trigger an "state" update
                def = this._setValue({operation: "ADD", id: evt.data.id}).then(
                    function() {
                        self._ids_to_wait = _.without(self._ids_to_wait, evt.data.id);
                        if (evt.data.on_onchange) {
                            evt.data.on_onchange();
                        }
                    }
                );
            }
            return def;
        },

        /**
         * Runs the x2many (1,id,values) command.
         *
         * @private
         * @param {CustomEevent} evt
         */
        _onUpdateQuickRecord: function(evt) {
            evt.stopPropagation();
            this._doUpdateQuickRecord(evt.data.id, evt.data.data, {
                on_onchange: evt.data.on_onchange,
                on_autosave: evt.data.on_autosave,
                on_autosaved: evt.data.on_autosaved,
            });
        },

        /**
         * @param {Number} id
         * @param {Object} data
         * @param {Function} callback
         */
        _doUpdateQuickRecord: function(id, data, options) {
            options = options || {};
            var self = this;
            var def = false;
            var model = this.parent_controller.model;
            model.updateRecordContext(id, {need_notify: false});
            if (this.options.auto_save) {
                model.updateRecordContext(id, {need_save: true});
                def = this._setValue(
                    {operation: "UPDATE", id: id, data: data},
                    {notifyChange: true}
                ).then(function() {
                    if (options.on_onchange) {
                        options.on_onchange();
                    }
                    self._ids_to_wait = _.without(self._ids_to_wait, id);
                    self._ids_to_update[id] = {
                        on_autosave: options.on_autosave,
                        on_autosaved: options.on_autosaved,
                    };
                    if (_.isEmpty(self._ids_to_wait)) {
                        self._resetSaveTimeout(true);
                    }
                });
            } else {
                // This will trigger an "state" update
                def = this._setValue({operation: "UPDATE", id: id, data: data}).then(
                    function() {
                        self._ids_to_wait = _.without(self._ids_to_wait, id);
                        if (options.on_onchange) {
                            options.on_onchange();
                        }
                    }
                );
            }
            return def;
        },

        /**
         * Runs the x2many (1,id,values) command.
         *
         * @private
         * @param {CustomEevent} evt
         */
        _onModifyQuickRecord: function(evt) {
            evt.stopPropagation();
            if (this.options.auto_save) {
                if (!evt.data.not_wait) {
                    this._ids_to_wait.push(evt.data.id);
                }
                this._resetSaveTimeout();
            }
        },

        /**
         * Handle auto_save when remove a record
         *
         * @param {CustomEvent} evt
         */
        _onListRecordRemove: function(evt) {
            var self = this;
            evt.stopPropagation();
            var model = this.parent_controller.model;
            var def = false;
            model.setPureVirtual(evt.data.id, false);
            model.updateRecordContext(evt.data.id, {need_notify: false});
            if (this.options.auto_save) {
                model.updateRecordContext(evt.data.id, {need_save: true});
                def = this._setValue(
                    {operation: "DELETE", ids: [evt.data.id]},
                    {notifyChange: true}
                ).then(function() {
                    if (evt.data.on_onchange) {
                        evt.data.on_onchange();
                    }
                    self._ids_to_wait = _.without(self._ids_to_wait, evt.data.id);
                    self._ids_to_update[evt.data.id] = {
                        on_autosave: evt.data.on_autosave,
                        on_autosaved: evt.data.on_autosaved,
                    };
                    if (_.isEmpty(self._ids_to_wait)) {
                        self._resetSaveTimeout(true);
                    }
                });
            } else {
                // This will trigger an "state" update
                def = this._setValue({operation: "DELETE", ids: [evt.data.id]}).then(
                    function() {
                        self._ids_to_wait = _.without(self._ids_to_wait, evt.data.id);
                        if (evt.data.on_onchange) {
                            evt.data.on_onchange();
                        }
                    }
                );
            }
            return def;
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
            var self = this;
            if (this._isLoading) {
                return;
            }
            this._getSearchRecords({
                offset: this._searchOffset,
            }).then(function(records) {
                return self.renderer.appendSearchRecords(records);
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
         */
        _onPauseAutoSave: function() {
            if (this._auto_save_timeout) {
                clearTimeout(this._auto_save_timeout);
                this._auto_save_timeout = null;
                this._need_resume_auto_save = true;
            }
            this._is_auto_save_paused = true;
        },

        _onResumeAutoSave: function() {
            // Check if can resume
            if (
                !this._is_auto_save_paused ||
                this.$(".oe_product_picker_quick_modif_price").is(":visible") ||
                this.$(".oe_search_input").is(":focus") ||
                this.$(".oe_flip_card.active").length
            ) {
                return;
            }

            if (this._need_resume_auto_save) {
                if (this._auto_save_timeout) {
                    clearTimeout(this._auto_save_timeout);
                }
                this._auto_save_timeout = setTimeout(
                    this._saveDocument.bind(this),
                    this.options.auto_save_delay,
                    this._ids_to_update
                );
                this._need_resume_auto_save = false;
            }
            this._is_auto_save_paused = false;
        },

        _resetSaveTimeout: function(launch_new) {
            if (this._is_auto_save_paused) {
                this._need_resume_auto_save = true;
                return;
            }
            if (this._auto_save_timeout) {
                clearTimeout(this._auto_save_timeout);
                this._auto_save_timeout = setTimeout(
                    this._saveDocument.bind(this),
                    this.options.auto_save_delay,
                    this._ids_to_update
                );
            } else if (launch_new) {
                this._auto_save_timeout = setTimeout(
                    this._saveDocument.bind(this),
                    this.options.auto_save_delay,
                    this._ids_to_update
                );
            }
        },

        /**
         * Clear auto-save timeout if the changes are commited
         *
         * @returns {Promise}
         */
        commitChanges: function() {
            if (this._auto_save_timeout) {
                clearTimeout(this._auto_save_timeout);
                this._auto_save_timeout = null;
            }
            return this._super.apply(this, arguments);
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
            var self = this;
            return this._super.apply(this, arguments).then(function() {
                self.updateBadgeLines();
                self.updateSubtotalPrice();
            });
        },
    });

    field_registry.add("one2many_product_picker", FieldOne2ManyProductPicker);

    return FieldOne2ManyProductPicker;
});
