/* Copyright 2019 Onestein
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define('web_group_by_percentage', function (require) {
    "use strict";

    var ListRenderer = require('web.ListRenderer'),
        BasicModel = require('web.BasicModel');

    ListRenderer.include({
        /**
         * Render the percentage to the group row.
         *
         * @override
         */
        _renderGroupRow: function (group) {
            var self = this;
            var res = this._super.apply(this, arguments);
            _.each(group.aggregatePercentages, function (percentage, field) {
                var cellIndex = _.findIndex(self.columns, function (column) {
                    if (field === column.attrs.name) {
                        return true;
                    }
                });

                var $cell = $(res.find('td').get(cellIndex - 1));
                var $b = $('<span>')
                    .addClass('web_group_by_percentage')
                    .html(_.str.sprintf('%s%% ', percentage.toFixed(2)))
                    .data('percentage', percentage);
                $cell.prepend($b);
            });
            return res;
        },
    });

    BasicModel.include({
        /**
         * Adds aggregatePercentages to the result.
         *
         * @override
         */
        get: function () {
            var result = this._super.apply(this, arguments),
                dp = result && this.localData[result.id];
            if (dp) {
                if (dp.aggregatePercentages) {
                    result.aggregatePercentages = $.extend({}, dp.aggregatePercentages);
                }
            }
            return result;
        },
        
        /**
         * Calculate percentages.
         *
         * @override
         */
        _readGroup: function () {
            var self = this,
                res = this._super.apply(this, arguments);
            res.done(function (list) {
                // Calculate totals
                var sums = {};
                _.each(list.data, function (groupId) {
                    var group = self.get(groupId);
                    _.each(group.aggregateValues, function (value, field) {
                        if (!(field in sums)) {
                            sums[field] = 0;
                        }
                        sums[field] += value;
                    });
                });

                // Calculate percentages
                _.each(list.data, function (groupId) {
                    var group = self.get(groupId),
                        aggregatePercentages = {};
                    _.each(_.keys(sums), function (field) {
                        var percentage = 0;
                        if (sums[field]) {
                            percentage = (group.aggregateValues[field] / sums[field]) * 100;
                        }
                        aggregatePercentages[field] = percentage;
                    });
                    var dp = self.localData[groupId];
                    dp.aggregatePercentages = aggregatePercentages;
                });
                return list;
            });
            return res;
        },
    });
});
