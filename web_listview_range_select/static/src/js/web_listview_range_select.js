/* Copyright 2017 Onestein
* License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define('web_listview_range_select', function (require) {
"use strict";

    var ListRenderer = require('web.ListRenderer');

    ListRenderer.include({
        _range_history: [],

        _get_range_selection: function() {
            var self = this;
            var result = {ids: [], records: []};

            //Get start and end
            var start = null,
                end = null;

            this.$el.find('td.o_list_record_selector input').each(function (i, el) {
                var id = $(el).closest('tr').data('id');
                var checked = self._range_history.indexOf(id) != -1;
                if (checked && $(el).prop('checked')) {
                    if (start == null)
                        start = i;
                    else
                        end = i;
                }
            });

            //Preserve already checked
            this.$el.find('td.o_list_record_selector input:checked').closest('tr').each(function (i, el) {
                if (i == start || i == end) return;
                var record_id = $(el).data('id')
                result.ids.push(record_id);
                result.records.push(el.attributes);
            });

            var new_range = this.get_range_selection(start, end);
            result.records = result.records.concat(new_range.records);
            result.ids = _.uniq(result.ids.concat(new_range.ids));

            return result;
        },

        get_range_selection: function(start, end) {
            var result = {ids: [], records: []};
            this.$el.find('td.o_list_record_selector input').closest('tr').each(function (i, el) {
                var record_id = $(el).data('id');
                if (start != null && end != null && i >= start && i <= end) {
                    result.ids.push(record_id);
                    result.records.push(el.attributes);
                } else if(start != null && end == null && start == i) {
                    result.ids.push(record_id);
                    result.records.push(el.attributes);
                }
            });
            return result;
        },

        push_range_history: function(id) {
            this._range_history.push(id);
            if (this._range_history.length == 3)
                this._range_history.shift();
        },

        _onSelectRecord: function(event) {
            var res = this._super(event);
            var self = this;
            var el = $(event.currentTarget);
            if (el.find('input').prop('checked'))
                self.push_range_history(el.closest('tr').data('id'));

            if (event.shiftKey) {
                //Get selection
                var selection = self._get_range_selection();
                this.$el.find('td.o_list_record_selector input').closest('tr').each(function () {
                    //Check input visual
                    var record_id = $(this).data('id');
                    if (selection.ids.indexOf(record_id) != -1)
                        $(this).find('td.o_list_record_selector input').prop('checked', true);
                });

                //Check input internal
                this.trigger_up(
                    'selection_changed', {
                        'selection': selection.ids
                    }
                );
            }
            return res;
        }
    });
});
