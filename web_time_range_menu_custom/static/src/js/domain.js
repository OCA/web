/* Copyright 2021 Tecnativa - Alexandre D. Díaz
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */
odoo.define("web_time_range_menu_custom.Domain", function(require) {
    "use strict";

    const Domain = require("web.Domain");

    Domain.include({
        /**
         * @override
         */
        constructCustomDomain: function(
            fieldName,
            period,
            type,
            comparisonPeriod,
            periodCustom,
            comparisonPeriodCustom
        ) {
            let leftBoundaryParams = {};
            let rightBoundaryParams = {};
            let offsetPeriodParams = 0;
            // Cloned function from web.domain
            // Necessary because inner function usage
            // TODO: Check changes in new versions
            function makeInterval() {
                switch (comparisonPeriod) {
                    case "previous_period":
                        _.each(offsetPeriodParams, function(value, key) {
                            if (
                                !leftBoundaryParams[key] ||
                                _.isNumber(leftBoundaryParams[key])
                            ) {
                                leftBoundaryParams[key] =
                                    value + (leftBoundaryParams[key] || 0);
                            } else {
                                leftBoundaryParams[key] =
                                    value + " + " + leftBoundaryParams[key];
                            }
                            if (
                                !rightBoundaryParams[key] ||
                                _.isNumber(rightBoundaryParams[key])
                            ) {
                                rightBoundaryParams[key] =
                                    value + (rightBoundaryParams[key] || 0);
                            } else {
                                rightBoundaryParams[key] =
                                    value + " + " + rightBoundaryParams[key];
                            }
                        });
                        break;
                    case "previous_year":
                        leftBoundaryParams.years = leftBoundaryParams.years
                            ? leftBoundaryParams.years - 1
                            : -1;
                        rightBoundaryParams.years = rightBoundaryParams.years
                            ? rightBoundaryParams.years - 1
                            : -1;
                        break;
                    case "custom_comparison_period":
                        // This case is the addition for custom periods
                        leftBoundaryParams[
                            comparisonPeriodCustom.type
                        ] = leftBoundaryParams[comparisonPeriodCustom.type]
                            ? leftBoundaryParams[comparisonPeriodCustom.type] -
                              comparisonPeriodCustom.value
                            : -comparisonPeriodCustom.value;
                        rightBoundaryParams[
                            comparisonPeriodCustom.type
                        ] = rightBoundaryParams[comparisonPeriodCustom.type]
                            ? rightBoundaryParams[comparisonPeriodCustom.type] -
                              comparisonPeriodCustom.value
                            : -comparisonPeriodCustom.value;
                        break;
                }

                var stringifyParams = function(value, key) {
                    return key + "=" + value;
                };
                var leftBoundaryStringifyParams = _.map(
                    leftBoundaryParams,
                    stringifyParams
                ).join(", ");
                var rightBoundaryStringifyParams = _.map(
                    rightBoundaryParams,
                    stringifyParams
                ).join(", ");

                if (type === "date") {
                    return (
                        "['&'," +
                        "('" +
                        fieldName +
                        "', '>=', (context_today() + relativedelta(" +
                        leftBoundaryStringifyParams +
                        ")).strftime('%Y-%m-%d'))," +
                        "('" +
                        fieldName +
                        "', '<', (context_today() + relativedelta(" +
                        rightBoundaryStringifyParams +
                        ")).strftime('%Y-%m-%d'))" +
                        "]"
                    );
                }
                return (
                    "['&'," +
                    "('" +
                    fieldName +
                    "', '>=', " +
                    "(datetime.datetime.combine(context_today() + relativedelta(" +
                    leftBoundaryStringifyParams +
                    "), datetime.time(0,0,0)).to_utc()).strftime('%Y-%m-%d %H:%M:%S'))," +
                    "('" +
                    fieldName +
                    "', '<', " +
                    "(datetime.datetime.combine(context_today() + relativedelta(" +
                    rightBoundaryStringifyParams +
                    "), datetime.time(0,0,0)).to_utc()).strftime('%Y-%m-%d %H:%M:%S'))" +
                    "]"
                );
            }

            function defineCustom() {
                if (periodCustom.type === "years") {
                    leftBoundaryParams = {month: 1, day: 1, years: -periodCustom.value};
                    rightBoundaryParams = {month: 1, day: 1};
                    offsetPeriodParams = {years: -periodCustom.value};
                } else if (periodCustom.type === "months") {
                    leftBoundaryParams = {day: 1, months: -periodCustom.value};
                    rightBoundaryParams = {day: 1};
                    offsetPeriodParams = {months: -periodCustom.value};
                } else if (periodCustom.type === "weeks") {
                    leftBoundaryParams = {
                        days: 1,
                        weekday: 0,
                        weeks: -periodCustom.value,
                    };
                    rightBoundaryParams = {days: 1, weekday: 0};
                    offsetPeriodParams = {weeks: -periodCustom.value};
                } else if (periodCustom.type === "days") {
                    leftBoundaryParams = {days: -periodCustom.value};
                    rightBoundaryParams = {};
                    offsetPeriodParams = {days: -periodCustom.value};
                }
            }

            // Cloned from web.domain
            // Necessary because can have customPeriod or/and comparisonPeriodCustom
            // TODO: Check changes in new versions
            switch (period) {
                case "today":
                    leftBoundaryParams = {};
                    rightBoundaryParams = {days: 1};
                    offsetPeriodParams = {days: -1};
                    return makeInterval();
                case "this_week":
                    leftBoundaryParams = {weeks: -1, days: 1, weekday: 0};
                    rightBoundaryParams = {days: 1, weekday: 0};
                    offsetPeriodParams = {weeks: -1};
                    return makeInterval();
                case "this_month":
                    leftBoundaryParams = {day: 1};
                    rightBoundaryParams = {day: 1, months: 1};
                    offsetPeriodParams = {months: -1};
                    return makeInterval();
                case "this_quarter":
                    leftBoundaryParams = {
                        months: "- (context_today().month - 1) % 3",
                        day: 1,
                    };
                    rightBoundaryParams = {
                        months: "3 - (context_today().month - 1) % 3",
                        day: 1,
                    };
                    offsetPeriodParams = {months: -3};
                    return makeInterval();
                case "this_year":
                    leftBoundaryParams = {month: 1, day: 1};
                    rightBoundaryParams = {month: 1, day: 1, years: 1};
                    offsetPeriodParams = {years: -1};
                    return makeInterval();
                case "yesterday":
                    leftBoundaryParams = {days: -1};
                    rightBoundaryParams = {};
                    offsetPeriodParams = {days: -1};
                    return makeInterval();
                case "last_week":
                    leftBoundaryParams = {weeks: -2, days: 1, weekday: 0};
                    rightBoundaryParams = {weeks: -1, days: 1, weekday: 0};
                    offsetPeriodParams = {weeks: -1};
                    return makeInterval();
                case "last_month":
                    leftBoundaryParams = {months: -1, day: 1};
                    rightBoundaryParams = {day: 1};
                    offsetPeriodParams = {months: -1};
                    return makeInterval();
                case "last_quarter":
                    leftBoundaryParams = {
                        months: "- 3 - (context_today().month - 1) % 3",
                        day: 1,
                    };
                    rightBoundaryParams = {
                        months: "- (context_today().month - 1) % 3",
                        day: 1,
                    };
                    offsetPeriodParams = {months: -3};
                    return makeInterval();
                case "last_year":
                    leftBoundaryParams = {month: 1, day: 1, years: -1};
                    rightBoundaryParams = {month: 1, day: 1};
                    offsetPeriodParams = {years: -1};
                    return makeInterval();
                case "last_7_days":
                    leftBoundaryParams = {days: -7};
                    rightBoundaryParams = {};
                    offsetPeriodParams = {days: -7};
                    return makeInterval();
                case "last_30_days":
                    leftBoundaryParams = {days: -30};
                    rightBoundaryParams = {};
                    offsetPeriodParams = {days: -30};
                    return makeInterval();
                case "last_365_days":
                    leftBoundaryParams = {days: -365};
                    rightBoundaryParams = {};
                    offsetPeriodParams = {days: -365};
                    return makeInterval();
                case "last_5_years":
                    leftBoundaryParams = {years: -5};
                    rightBoundaryParams = {};
                    offsetPeriodParams = {years: -5};
                    return makeInterval();
                case "custom_period":
                    // This case is the addition for custom periods
                    defineCustom();
                    return makeInterval();
            }
        },
    });
});
