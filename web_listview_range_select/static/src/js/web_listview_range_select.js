/* Copyright 2017 Onestein
* License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define('web_listview_range_select', function (require) {
"use strict";
    var core = require('web.core'),
        _t = core._t,
        listview = require('web.ListView');

    listview.List.include({
        _range_history: [],
        _get_range_selection: function() {
            var self = this;
            var result = {ids: [], records: []};
            if (!this.options.selectable) {
                return result;
            }
            var records = this.records;

            //Get start and end
            var start = null,
                end = null;

            this.$current.find('td.o_list_record_selector input').each(function (i, el) {
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
            this.$current.find('td.o_list_record_selector input:checked').closest('tr').each(function (i, el) {
                if (i == start || i == end) return;
                var record = records.get($(el).data('id'));
                result.ids.push(record.get('id'));
                result.records.push(record.attributes);
            });

            var new_range = this.get_range_selection(start, end);
            result.records = result.records.concat(new_range.records);
            result.ids = result.ids.concat(new_range.ids);

            return result;
        },
        get_range_selection: function(start, end) {
            var records = this.records;
            var result = {ids: [], records: []};
            this.$current.find('td.o_list_record_selector input').closest('tr').each(function (i, el) {
                var record = records.get($(el).data('id'));
                if (start != null && end != null && i >= start && i <= end) {
                    result.ids.push(record.get('id'));
                    result.records.push(record.attributes);
                } else if(start != null && end == null && start == i) {
                    result.ids.push(record.get('id'));
                    result.records.push(record.attributes);
                }
            });
            return result;
        },
        push_range_history: function(id) {
            this._range_history.push(id);
            if (this._range_history.length == 3)
                this._range_history.shift();
        },
        init: function() {
            var self = this;
            var res = this._super.apply(this, arguments);
            this.$current.delegate('td.o_list_record_selector', 'click', function (e) {
                //Update history
                if ($(this).find('input').prop('checked'))
                    self.push_range_history($(this).closest('tr').data('id'));

                if (e.shiftKey) {
                    //Get selection
                    var selection = self._get_range_selection();
                    self.$current.find('td.o_list_record_selector input').closest('tr').each(function () {
                        //Check input visual
                        var record = self.records.get($(this).data('id'));
                        if (selection.ids.indexOf(record.get('id')) != -1)
                            $(this).find('td.o_list_record_selector input').prop('checked', true);
                    });
                    //Check input internal
                    $(self).trigger(
                        'selected', [selection.ids, selection.records, true]);
                }
            });
            return res;
        }
    });
});
