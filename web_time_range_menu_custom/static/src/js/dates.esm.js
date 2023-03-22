/** @odoo-module **/
/* eslint-disable init-declarations */
/* Copyright 2022 Tecnativa - Carlos Roca
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html) */

import {patch} from "@web/core/utils/patch";
import {Domain} from "@web/core/domain";
import {serializeDate, serializeDateTime} from "@web/core/l10n/dates";
import {localization} from "@web/core/l10n/localization";
/* Redefine some methods of dates.js from web.static.src.utils to
add support to days and weeks periods */
import * as dates from "@web/search/utils/dates";

/**
 * Method used to calculate the quantity of days and weeks of the
 * actual year.
 */
function _getQtyOfCurrentYear(option) {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31);
    let millisecondsPerWeek = 0;
    if (option === "week") {
        millisecondsPerWeek = 604800000;
    } else if (option === "day") {
        millisecondsPerWeek = 86400000;
    } else {
        return;
    }
    const weeks = Math.ceil((endOfYear - startOfYear) / millisecondsPerWeek);
    return weeks;
}

Object.assign(dates.PER_YEAR, {
    week: _getQtyOfCurrentYear("week"),
    day: _getQtyOfCurrentYear("day"),
});

// This is needed to call the super functions on @web/search/utils/dates
const _getSetParam = dates.getSetParam;

// Patch of functions defined before
patch(dates, "patch dates", {
    /*
     * Redefine function to avoid the exclusion of days and weeks.
     */
    constructDateDomain(
        referenceMoment,
        fieldName,
        fieldType,
        selectedOptionIds,
        comparisonOptionId
    ) {
        let plusParam;
        let selectedOptions;
        if (comparisonOptionId) {
            [plusParam, selectedOptions] = dates.getComparisonParams(
                referenceMoment,
                selectedOptionIds,
                comparisonOptionId
            );
        } else {
            selectedOptions = dates.getSelectedOptions(
                referenceMoment,
                selectedOptionIds
            );
        }
        const yearOptions = selectedOptions.year;
        const otherOptions = [
            ...(selectedOptions.quarter || []),
            ...(selectedOptions.month || []),
            ...(selectedOptions.day || []),
            ...(selectedOptions.week || []),
        ];
        dates.sortPeriodOptions(yearOptions);
        dates.sortPeriodOptions(otherOptions);
        const ranges = [];
        for (const yearOption of yearOptions) {
            const constructRangeParams = {
                referenceMoment,
                fieldName,
                fieldType,
                plusParam,
            };
            if (otherOptions.length) {
                for (const option of otherOptions) {
                    const setParam = Object.assign(
                        {},
                        yearOption.setParam,
                        option ? option.setParam : {}
                    );
                    const {granularity, custom_period} = option;
                    if (comparisonOptionId && custom_period.is_custom_period) {
                        custom_period.is_comparison = true;
                    }
                    const range = dates.constructDateRange(
                        Object.assign(
                            {granularity, custom_period, setParam},
                            constructRangeParams
                        )
                    );
                    ranges.push(range);
                }
            } else {
                const {granularity, custom_period, setParam} = yearOption;
                if (comparisonOptionId && custom_period.is_custom_period) {
                    custom_period.is_comparison = true;
                }
                const range = dates.constructDateRange(
                    Object.assign(
                        {granularity, custom_period, setParam},
                        constructRangeParams
                    )
                );
                ranges.push(range);
            }
        }
        const domain = Domain.combine(
            ranges.map((range) => range.domain),
            "OR"
        );
        const description = ranges.map((range) => range.description).join("/");
        return {domain, description};
    },
    constructDateRange(params) {
        const {
            referenceMoment,
            fieldName,
            fieldType,
            granularity,
            setParam,
            plusParam,
            custom_period,
        } = params;
        if ("quarter" in setParam) {
            // Luxon does not consider quarter key in setParam (like moment did)
            setParam.month = dates.QUARTERS[setParam.quarter].coveredMonths[0];
            delete setParam.quarter;
        }
        const plusParamReferenceMoment = referenceMoment.plus(plusParam || {});
        const date = referenceMoment.set(setParam).plus(plusParam || {});
        // Compute domain
        const leftDate = date.startOf(granularity);
        var rightDate = date.endOf(granularity);
        if (custom_period.is_custom_period) {
            rightDate = plusParamReferenceMoment;
        }
        let leftBound;
        let rightBound;
        if (fieldType === "date") {
            leftBound = serializeDate(leftDate);
            rightBound = serializeDate(rightDate);
        } else {
            leftBound = serializeDateTime(leftDate);
            rightBound = serializeDateTime(rightDate);
        }
        const domain = new Domain([
            "&",
            [fieldName, ">=", leftBound],
            [fieldName, "<=", rightBound],
        ]);
        // Compute description
        var description = "";
        if (custom_period.is_custom_period) {
            if (plusParam) {
                const key = Object.keys(plusParam)[0];
                description = "Previous " + Math.abs(plusParam[key]) + " " + key;
            } else {
                description =
                    "Last " + custom_period.last_period + " " + granularity + "s";
            }
        } else {
            var descriptions = [date.toFormat("yyyy")];
            const method = localization.direction === "rtl" ? "push" : "unshift";
            if (granularity === "month") {
                descriptions[method](date.toFormat("MMMM"));
            } else if (granularity === "quarter") {
                const quarter = date.quarter;
                descriptions[method](dates.QUARTERS[quarter].description.toString());
            } else if (granularity === "day") {
                descriptions[method](date.toFormat("dd MMMM"));
            } else if (granularity === "week") {
                descriptions[method](date.toFormat("'W'WW"));
            }
            description = descriptions.join(" ");
        }
        return {domain, description};
    },
    /*
     * Redefine function to allow process days and weeks.
     */
    getPeriodOptions(referenceMoment) {
        const options = [];
        const originalOptions = Object.values(dates.PERIOD_OPTIONS);
        for (const option of originalOptions) {
            const {id, groupNumber} = option;
            let description;
            let defaultYear;
            switch (option.granularity) {
                case "quarter":
                    description = option.description.toString();
                    defaultYear = referenceMoment.set(option.setParam).year;
                    break;
                case "day":
                case "week":
                case "month":
                case "year":
                    const date = referenceMoment.plus(option.plusParam);
                    description = option.description || date.toFormat(option.format);
                    defaultYear = date.year;
                    break;
            }
            const setParam = dates.getSetParam(option, referenceMoment);
            options.push({id, groupNumber, description, defaultYear, setParam});
        }
        const periodOptions = [];
        for (const option of options) {
            const {id, groupNumber, description, defaultYear} = option;
            const yearOption = options.find(
                (o) => o.setParam && o.setParam.year === defaultYear
            );
            periodOptions.push({
                id,
                groupNumber,
                description,
                defaultYearId: yearOption.id,
            });
        }
        return periodOptions;
    },
    /*
     * Add selection of month when week or day selected.
     *
     * @override
     */
    getSetParam(periodOption, referenceMoment) {
        if (periodOption.granularity === "day") {
            const date = referenceMoment.plus(periodOption.plusParam);
            return {
                day: date.day,
                month: date.month,
            };
        } else if (periodOption.granularity === "week") {
            const date = referenceMoment.plus(periodOption.plusParam);
            return {
                weekNumber: date.weekNumber,
            };
        }
        return _getSetParam(...arguments);
    },
    getSelectedOptions(referenceMoment, selectedOptionIds) {
        const selectedOptions = {year: []};
        for (const optionId of selectedOptionIds) {
            const option = dates.PERIOD_OPTIONS[optionId];
            const setParam = dates.getSetParam(option, referenceMoment);
            const custom_period = option.custom_period || {};
            const granularity = option.granularity;
            if (!selectedOptions[granularity]) {
                selectedOptions[granularity] = [];
            }
            selectedOptions[granularity].push({granularity, setParam, custom_period});
        }
        return selectedOptions;
    },
    /*
     * Add support to day and week options.
     *
     */
    getComparisonParams(referenceMoment, selectedOptionIds, comparisonOptionId) {
        const comparisonOption = dates.COMPARISON_OPTIONS[comparisonOptionId];
        const selectedOptions = dates.getSelectedOptions(
            referenceMoment,
            selectedOptionIds
        );
        if (comparisonOption.plusParam) {
            return [comparisonOption.plusParam, selectedOptions];
        }
        const plusParam = {};
        let globalGranularity = "year";
        if (selectedOptions.day) {
            globalGranularity = "day";
        } else if (selectedOptions.week) {
            globalGranularity = "week";
        } else if (selectedOptions.month) {
            globalGranularity = "month";
        } else if (selectedOptions.quarter) {
            globalGranularity = "quarter";
        }
        const granularityFactor = dates.PER_YEAR[globalGranularity];
        const years = selectedOptions.year.map((o) => o.setParam.year);
        const yearMin = Math.min(...years);
        const yearMax = Math.max(...years);
        let optionMin = 0;
        let optionMax = 0;
        if (selectedOptions.quarter) {
            const quarters = selectedOptions.quarter.map((o) => o.setParam.quarter);
            if (globalGranularity === "month") {
                delete selectedOptions.quarter;
                for (const quarter of quarters) {
                    for (const month of dates.QUARTERS[quarter].coveredMonths) {
                        const monthOption = selectedOptions.month.find(
                            (o) => o.setParam.month === month
                        );
                        if (!monthOption) {
                            selectedOptions.month.push({
                                setParam: {month},
                                granularity: "month",
                            });
                        }
                    }
                }
            } else {
                optionMin = Math.min(...quarters);
                optionMax = Math.max(...quarters);
            }
        }
        if (selectedOptions.month) {
            const months = selectedOptions.month.map((o) => o.setParam.month);
            optionMin = Math.min(...months);
            optionMax = Math.max(...months);
        }
        if (selectedOptions.week) {
            const weeks = selectedOptions.week.map((o) => o.setParam.weekNumber);
            optionMin = Math.min(...weeks);
            optionMax = Math.max(...weeks);
        }
        if (selectedOptions.day) {
            const days = selectedOptions.day.map((o) => o.setParam.day);
            optionMin = Math.min(...days);
            optionMax = Math.max(...days);
        }
        const num =
            -1 + granularityFactor * (yearMin - yearMax) + optionMin - optionMax;
        const key =
            globalGranularity === "year"
                ? "years"
                : globalGranularity === "month"
                ? "months"
                : globalGranularity === "week"
                ? "weeks"
                : globalGranularity === "day"
                ? "days"
                : "quarters";
        plusParam[key] = num;
        return [plusParam, selectedOptions];
    },
});
