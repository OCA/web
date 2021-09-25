/* Copyright 2021 Tecnativa - Alexandre D. Díaz
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */
odoo.define("web_time_range_menu_custom.SearchFacet", function(require) {
    "use strict";

    const core = require("web.core");
    const SearchFacet = require("web.SearchFacet");

    const _t = core._t;

    SearchFacet.include({
        /**
         * @override
         */
        _getFilterDescription: function(filter) {
            if (
                filter.type === "timeRange" &&
                (filter.timeRangeId === "custom_period" ||
                    filter.comparisonTimeRangeId === "custom_comparison_period")
            ) {
                let description = filter.description;
                if (filter.timeRangeId === "custom_period") {
                    description +=
                        ": " +
                        _t("Last ") +
                        `${filter.timeRangeCustom.value} ${filter.timeRangeCustom.type}`;
                } else {
                    var timeRangeValue = _.findWhere(filter.timeRangeOptions, {
                        optionId: filter.timeRangeId,
                    });
                    description += ": " + timeRangeValue.description;
                }

                if (filter.comparisonTimeRangeId) {
                    if (filter.comparisonTimeRangeId === "custom_comparison_period") {
                        description +=
                            " / " +
                            _t("Previous ") +
                            `${filter.comparisonTimeRangeCustom.value} ${filter.comparisonTimeRangeCustom.type}`;
                    } else {
                        var comparisonTimeRangeValue = _.findWhere(
                            filter.comparisonTimeRangeOptions,
                            {
                                optionId: filter.comparisonTimeRangeId,
                            }
                        );
                        description += " / " + comparisonTimeRangeValue.description;
                    }
                }

                return description;
            }

            return this._super.apply(this, arguments);
        },
    });
});
