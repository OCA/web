/** @odoo-module */

import {ListRenderer} from "@web/views/list/list_renderer";
import {formatPercentage} from "@web/views/fields/formatters";
import {patch} from "@web/core/utils/patch";

patch(ListRenderer.prototype, "list_group_by_percentage", {
    getActiveColumns(list) {
        /**
         * @override
         * This method is called in the onWillUpdateProps to update column data.
         *
         * Adds a sum_value_column variable to each numeric columns,
         * to allow for an easier calculation of aggregate percentage
         * for each line of a given column
         */
        var columns = this._super(list);

        if (list.isGrouped) {
            for (var column of columns) {
                if (column.type != "field" || !this.isNumericColumn(column)) continue;

                column.totalSum = 0;
                for (var group of list.groups) {
                    column.totalSum += group.aggregates[column.name];
                }
            }
        }

        return columns;
    },

    aggregatePercentage: function (group, column) {
        /**
         * @returns a string value representing the percentage of the given group over the column total sum.
         */
        if (!(column.name in group.aggregates) || column.totalSum === undefined) {
            return "";
        }

        var aggregateValue = group.aggregates[column.name];
        var totalSum = column.totalSum;

        return formatPercentage(aggregateValue / totalSum);
    },

    freezeColumnWidths() {
        /**
         * @override
         *
         * Having a fixed table layout can lead to text overflow values with the added percentages
         * if the aggregate values are high enough.
         * As such, we restore the table layout CSS value to 'auto' to reduce text overflow.
         */
        this._super(...arguments);

        if (this.props.list.isGrouped) {
            this.tableRef.el.style.tableLayout = "auto";
        }
    },
});
