/* Copyright 2017 Onestein
* License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define('web_listview_range_select', function (require) {
"use strict";
    //debugger;
    var ListRenderer = require('web.ListRenderer');

    ListRenderer.include({
        events: {
            "mousedown": "_onMouseDown",
            "click .o_optional_columns_dropdown .dropdown-item": "_onToggleOptionalColumn",
            "click .o_optional_columns_dropdown_toggle": "_onToggleOptionalColumnDropdown",
            'click tbody tr': '_onRowClicked',
            'click tbody .o_list_record_selector': '_onSelectRecord',
            'click thead th.o_column_sortable': '_onSortColumn',
            'click .o_group_header': '_onToggleGroup',
            'change thead .o_list_record_selector input': '_onToggleSelection',
            'keypress thead tr td': '_onKeyPress',
            'keydown td': '_onKeyDown',
            'keydown th': '_onKeyDown',
        },
        _range_history: [],

        _render: function() {
            var res = this._super.apply(this, arguments);
            this.$table = this.$el.find('.o_list_view');
            return res;
        },

        _getRangeSelection: function() {
            var self = this;

            // Get start and end
            var start = null,
                end = null;

            this.$el.find('td.o_list_record_selector input').each(function (i, el) {
                var id = $(el).closest('tr').data('id');
                var checked = self._range_history.indexOf(id) !== -1;
                if (checked && $(el).is(':checked')) {
                    if (start == null) {
                        start = i;
                    } else {
                        end = i;
                    }
                }
            });
            var new_range = this._getSelectionByRange(start, end);

            var current_selection = this.selection;
            current_selection = _.uniq(current_selection.concat(new_range));
            return current_selection;
        },

        _getSelectionByRange: function(start, end) {
            var result = [];
            this.$el.find('td.o_list_record_selector input').closest('tr').each(function (i, el) {
                var record_id = $(el).data('id');
                if (start != null && end != null && i >= start && i <= end) {
                    result.push(record_id);
                } else if(start != null && end == null && start == i) {
                    result.push(record_id);
                }
            });
            return result;
        },

        _pushRangeHistory: function(id) {
            if (this._range_history.length === 2) {
                this._range_history = [];
            }
            this._range_history.push(id);
        },

        _deselectTable: function() {
            // This is needed because the checkboxes are not real checkboxes.
            window.getSelection().removeAllRanges();
        },

        _onSelectRecord: function(event) {
            //debugger;
            var el = $(event.currentTarget);
            var res = this._super(event);

            // Firefox shift click fix
            if (/firefox/i.test(navigator.userAgent) && event.shiftKey) {
                //debugger;
                el.find('input').prop('checked', !el.find('input').prop('checked'));
            }

            if (el.find('input').prop('checked')) {
                //debugger;
                this._pushRangeHistory(el.closest('tr').data('id'));
            }

            if (event.shiftKey) {
                //debugger;
                // Get selection
                var selection = this._getRangeSelection();
                var $rows = this.$el.find('td.o_list_record_selector input').closest('tr');
                $rows.each(function () {
                    //debugger;
                    // Check input visual
                    var record_id = $(this).data('id');
                    if (selection.indexOf(record_id) !== -1) {
                        $(this).find('td.o_list_record_selector input').prop('checked', true);
                    }
                });
                // Update selection internally
                this._updateSelection();
                this._deselectTable();
            }
            return res;
        }
    });
});
