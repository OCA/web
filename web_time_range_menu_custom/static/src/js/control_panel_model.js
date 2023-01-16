/* Copyright 2021 Tecnativa - Alexandre D. Díaz
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */
odoo.define("web_time_range_menu_custom.ControlPanelModel", function (require) {
    "use strict";

    const core = require("web.core");
    const Domain = require("web.Domain");
    const ControlPanelModel = require("web.ControlPanelModel");

    const _t = core._t;

    ControlPanelModel.include({
        activateTimeRangeCustom: function (
            filterId,
            timeRangeId,
            comparisonTimeRangeId,
            timeRangeCustom,
            comparisonTimeRangeCustom
        ) {
            var filter = this.filters[filterId];
            filter.timeRangeCustom = timeRangeCustom;
            filter.comparisonTimeRangeCustom = comparisonTimeRangeCustom;
            this.activateTimeRange(filterId, timeRangeId, comparisonTimeRangeId);
        },

        /**
         * @override
         */
        _getTimeRangeMenuData: function (evaluation) {
            const context = this._super.apply(this, arguments);
            // GroupOfTimeRanges can be undefined in case with withSearchBar is false
            var groupOfTimeRanges = this.groups[this._getGroupIdOfType("timeRange")];
            if (groupOfTimeRanges && groupOfTimeRanges.activeFilterIds.length) {
                var filter = this.filters[groupOfTimeRanges.activeFilterIds[0][0]];
                if (filter.timeRangeId === "custom_period") {
                    context.timeRangeMenuData.timeRange =
                        Domain.prototype.constructCustomDomain(
                            filter.fieldName,
                            filter.timeRangeId,
                            filter.fieldType,
                            undefined,
                            filter.timeRangeCustom
                        );
                    context.timeRangeMenuData.timeRangeDescription =
                        _t("Last ") +
                        `${filter.timeRangeCustom.value} ${filter.timeRangeCustom.type}`;
                    context.timeRangeMenuData.timeRangeCustomValue =
                        filter.timeRangeCustom.value;
                    context.timeRangeMenuData.timeRangeCustomType =
                        filter.timeRangeCustom.type;
                    if (evaluation) {
                        context.timeRangeMenuData.timeRange =
                            Domain.prototype.stringToArray(
                                context.timeRangeMenuData.timeRange
                            );
                    }
                    if (filter.comparisonTimeRangeId !== "custom_comparison_period") {
                        context.timeRangeMenuData.comparisonTimeRange =
                            Domain.prototype.constructCustomDomain(
                                filter.fieldName,
                                filter.timeRangeId,
                                filter.fieldType,
                                filter.comparisonTimeRangeId,
                                filter.timeRangeCustom,
                                filter.comparisonTimeRangeCustom
                            );
                        if (evaluation) {
                            context.timeRangeMenuData.comparisonTimeRange =
                                Domain.prototype.stringToArray(
                                    context.timeRangeMenuData.comparisonTimeRange
                                );
                        }
                    }
                }
                if (filter.comparisonTimeRangeId === "custom_comparison_period") {
                    context.timeRangeMenuData.comparisonTimeRange =
                        Domain.prototype.constructCustomDomain(
                            filter.fieldName,
                            filter.timeRangeId,
                            filter.fieldType,
                            filter.comparisonTimeRangeId,
                            filter.timeRangeCustom,
                            filter.comparisonTimeRangeCustom
                        );
                    context.timeRangeMenuData.comparisonTimeRangeDescription =
                        _t("Previous ") +
                        `${filter.comparisonTimeRangeCustom.value} ${filter.comparisonTimeRangeCustom.type}`;
                    context.timeRangeMenuData.comparisonTimeRangeCustomValue =
                        filter.comparisonTimeRangeCustom.value;
                    context.timeRangeMenuData.comparisonTimeRangeCustomType =
                        filter.comparisonTimeRangeCustom.type;

                    if (evaluation) {
                        context.timeRangeMenuData.comparisonTimeRange =
                            Domain.prototype.stringToArray(
                                context.timeRangeMenuData.comparisonTimeRange
                            );
                    }
                }
            }
            return context;
        },
    });
});
