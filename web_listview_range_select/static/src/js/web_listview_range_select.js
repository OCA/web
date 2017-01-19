/* Copyright 2017 Onestein
* License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define('web_listview_range_select', function (require) {
"use strict";
    var core = require('web.core'),
        _t = core._t,
        listview = require('web.ListView');

    listview.List.include({
        get_range_selection: function() {
            var result = {ids: [], records: []};
            if (!this.options.selectable) {
                return result;
            }
            var records = this.records;
            var start = null,
                end = null;

            //Get start and end;
            this.$current.find('td.o_list_record_selector input').each(function (i, el) {
                var checked = $(el).prop('checked');
                if (checked) {
                    if (start == null)
                        start = i;
                    else
                        end = i;
                }
            });

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
        init: function() {
            var self = this;
            var res = this._super.apply(this, arguments);
            this.$current.delegate('td.o_list_record_selector', 'click', function (e) {
                if (e.shiftKey) {
                    var selection = self.get_range_selection();
                    self.$current.find('td.o_list_record_selector input').closest('tr').each(function () {
                        var record = self.records.get($(this).data('id'));
                        if (selection.ids.indexOf(record.get('id')) != -1)
                            $(this).find('td.o_list_record_selector input').prop('checked', true);
                    });
                    $(self).trigger(
                        'selected', [selection.ids, selection.records, true]);
                }
            });
            return res;
        }
    });
});
