/** @odoo-module **/

import * as dates from "@web/search/utils/dates";

import {
    COMPARISON_OPTIONS,
    MONTH_OPTIONS,
    PER_YEAR,
    QUARTERS,
    QUARTER_OPTIONS,
    YEAR_OPTIONS,
    sortPeriodOptions,
} from "@web/search/utils/dates";
import {serializeDate, serializeDateTime} from "@web/core/l10n/dates";

import {Domain} from "@web/core/domain";
import {_lt} from "@web/core/l10n/translation";
import {localization} from "@web/core/l10n/localization";

const {DateTime} = luxon;

export const referenceMoment = DateTime.local();

const LAST_DAYS = {
    7: {description: _lt("Last 7 days")},
    30: {description: _lt("Last 30 days")},
    365: {description: _lt("Last 365 days")},
};

export const NEW_OPTIONS = {
    this_day: {
        id: "this_day",
        groupNumber: 3,
        description: _lt("Today"),
        granularity: "day",
        plusParam: {},
    },
    this_yesterday: {
        id: "this_yesterday",
        groupNumber: 3,
        description: _lt("Yesterday"),
        granularity: "day",
        plusParam: {days: -1},
    },
    this_week: {
        id: "this_week",
        groupNumber: 3,
        description: _lt("This week"),
        granularity: "week",
        plusParam: {},
    },
    last_week: {
        id: "last_week",
        groupNumber: 3,
        description: _lt("Last week"),
        granularity: "week",
        minusParams: {
            global: {weeks: 1},
        },
        plusParam: {},
    },
    last_7_days: {
        id: "last_7_days",
        groupNumber: 4,
        description: LAST_DAYS[7].description,
        granularity: "day",
        plusParam: {},
        minusParams: {
            leftDate: {days: 7},
        },
    },
    last_30_days: {
        id: "last_30_days",
        groupNumber: 4,
        description: LAST_DAYS[30].description,
        granularity: "day",
        plusParam: {},
        minusParams: {
            leftDate: {days: 30},
        },
    },
    last_365_days: {
        id: "last_365_days",
        groupNumber: 4,
        description: LAST_DAYS[365].description,
        granularity: "day",
        plusParam: {},
        minusParams: {
            leftDate: {days: 365},
        },
    },
};

export const CUSTOM_PERIOD_OPTIONS = Object.assign(
    {},
    MONTH_OPTIONS,
    QUARTER_OPTIONS,
    YEAR_OPTIONS,
    NEW_OPTIONS
);

export const CUSTOM_PER_YEAR = {
    ...PER_YEAR,
    day: 365,
    week: 52,
};

export function getMinusParams(selectedOptionIds) {
    const selectedOptions = [];
    for (const optionId of selectedOptionIds) {
        const option = CUSTOM_PERIOD_OPTIONS[optionId];
        if (option && option.minusParams) {
            selectedOptions.push(option.minusParams);
        }
    }
    return selectedOptions;
}

export function customGetSetParam(periodOption, refMoment) {
    if (periodOption.granularity === "quarter") {
        return periodOption.setParam;
    }
    const date = refMoment.plus(periodOption.plusParam);
    const granularity = periodOption.granularity;
    const setParam = {[granularity]: date[granularity]};
    return setParam;
}

export function customGetSelectedOptions(refMoment, selectedOptionIds) {
    const selectedOptions = {year: []};
    for (const optionId of selectedOptionIds) {
        const option = CUSTOM_PERIOD_OPTIONS[optionId];
        const setParam = customGetSetParam(option, refMoment);
        const granularity = option.granularity;
        if (!selectedOptions[granularity]) {
            selectedOptions[granularity] = [];
        }
        selectedOptions[granularity].push({granularity, setParam});
    }
    return selectedOptions;
}

export function customGetComparisonParams(
    refMoment,
    selectedOptionIds,
    comparisonOptionId
) {
    const comparisonOption = COMPARISON_OPTIONS[comparisonOptionId];
    const selectedOptions = customGetSelectedOptions(refMoment, selectedOptionIds);
    if (comparisonOption.plusParam) {
        return [comparisonOption.plusParam, selectedOptions];
    }
    const plusParam = {};
    const granularities = ["month", "quarter", "day", "week"];
    const globalGranularity =
        granularities.find((granularity) => selectedOptions[granularity]) || "year";
    const granularityFactor = CUSTOM_PER_YEAR[globalGranularity];
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
                for (const month of QUARTERS[quarter].coveredMonths) {
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
    const num = -1 + granularityFactor * (yearMin - yearMax) + optionMin - optionMax;
    const granularityMapping = {
        year: "years",
        month: "months",
        week: "weeks",
        day: "days",
        quarter: "quarters",
    };
    const key = granularityMapping[globalGranularity] || "quarters";
    plusParam[key] = num;
    return [plusParam, selectedOptions];
}

export function customConstructDateRange(params) {
    const {
        referenceMoment: refMoment,
        fieldName,
        fieldType,
        granularity,
        setParam,
        plusParam,
        minusParams,
        comparisonOptionId,
    } = params;
    if ("quarter" in setParam) {
        // Luxon does not consider quarter key in setParam (like moment did)
        setParam.month = QUARTERS[setParam.quarter].coveredMonths[0];
        delete setParam.quarter;
    }

    const globalMinus = minusParams && minusParams[0] && minusParams[0].global;
    const leftDateMinus = minusParams && minusParams[0] && minusParams[0].leftDate;
    const date = refMoment
        .set(setParam)
        .plus(plusParam || {})
        .minus(globalMinus || {});
    // Compute domain
    const leftDate = date.minus(leftDateMinus || {}).startOf(granularity);
    const rightDate = date.endOf(granularity);

    let leftBound = null;
    let rightBound = null;
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
    const descriptions =
        granularity !== "day" && granularity !== "week" ? [date.toFormat("yyyy")] : [];
    const method = localization.direction === "rtl" ? "push" : "unshift";

    if (granularity === "day") {
        let description = null;
        const leftMinusDays =
            minusParams &&
            minusParams[0] &&
            minusParams[0].leftDate &&
            minusParams[0].leftDate.days;
        const isToday = refMoment.day === date.day;
        const isYesterday = refMoment.day - 1 === date.day;

        if (comparisonOptionId && leftMinusDays) {
            description = `${_lt("From Date")} ${leftDate.toFormat(
                "dd LLL yyyy"
            )} ${_lt("Until")} ${rightDate.toFormat("dd LLL yyyy")}`;
        } else if (leftMinusDays) {
            description = LAST_DAYS[minusParams[0].leftDate.days].description;
        } else if (!comparisonOptionId && (isToday || isYesterday)) {
            description = isToday ? _lt("Today") : _lt("Yesterday");
        } else {
            description = date.toFormat("dd LLL yyyy");
        }

        descriptions[method](description);
    }
    if (granularity === "week") {
        let description = null;

        if (comparisonOptionId) {
            description = `${_lt("Week")}: ${date.weekNumber} - ${date.toFormat(
                "yyyy"
            )}`;
        } else {
            const isThisWeek = refMoment.weekNumber === date.weekNumber;
            description = isThisWeek ? _lt("This week") : _lt("Last week");
        }

        descriptions[method](description);
    }
    if (granularity === "month") {
        descriptions[method](date.toFormat("MMMM"));
    } else if (granularity === "quarter") {
        const quarter = date.quarter;
        descriptions[method](QUARTERS[quarter].description.toString());
    }
    const description = descriptions.join(" ");
    return {domain, description};
}

export function customConstructDateDomain(
    refMoment,
    fieldName,
    fieldType,
    selectedOptionIds,
    comparisonOptionId
) {
    let plusParam = null;
    let selectedOptions = null;
    if (comparisonOptionId) {
        [plusParam, selectedOptions] = customGetComparisonParams(
            refMoment,
            selectedOptionIds,
            comparisonOptionId
        );
    } else {
        selectedOptions = customGetSelectedOptions(refMoment, selectedOptionIds);
    }
    const minusParams = getMinusParams(selectedOptionIds);
    const yearOptions = selectedOptions.year;
    const otherOptions = [
        ...(selectedOptions.quarter || []),
        ...(selectedOptions.month || []),
        ...(selectedOptions.day || []),
        ...(selectedOptions.week || []),
    ];
    sortPeriodOptions(yearOptions);
    sortPeriodOptions(otherOptions);
    const ranges = [];
    for (const yearOption of yearOptions) {
        const constructRangeParams = {
            referenceMoment: refMoment,
            fieldName,
            fieldType,
            plusParam,
            minusParams,
            comparisonOptionId,
        };
        if (otherOptions.length) {
            for (const option of otherOptions) {
                const setParam = Object.assign(
                    {},
                    yearOption.setParam,
                    option ? option.setParam : {}
                );
                const {granularity} = option;
                const range = customConstructDateRange(
                    Object.assign({granularity, setParam}, constructRangeParams)
                );
                ranges.push(range);
            }
        } else {
            const {granularity, setParam} = yearOption;
            const range = customConstructDateRange(
                Object.assign({granularity, setParam}, constructRangeParams)
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
}

export function customGetPeriodOptions(refMoment) {
    // Adapt when solution for moment is found...
    const options = [];
    const originalOptions = Object.values(CUSTOM_PERIOD_OPTIONS);
    for (const option of originalOptions) {
        const {id, groupNumber} = option;
        let description = null;
        let defaultYear = null;
        switch (option.granularity) {
            case "quarter":
            case "week":
            case "day":
                description = option.description.toString();
                defaultYear = refMoment.set(option.setParam).year;
                break;
            case "month":
            case "year": {
                const date = refMoment.plus(option.plusParam);
                description = date.toFormat(option.format);
                defaultYear = date.year;
                break;
            }
        }
        const setParam = customGetSetParam(option, refMoment);
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
}

dates.constructDateDomain = customConstructDateDomain;
dates.constructDateRange = customConstructDateRange;
dates.getPeriodOptions = customGetPeriodOptions;
dates.getSelectedOptions = customGetSelectedOptions;
dates.getSetParam = customGetSetParam;
dates.getComparisonParams = customGetComparisonParams;
dates.PERIOD_OPTIONS = CUSTOM_PERIOD_OPTIONS;
dates.PER_YEAR = CUSTOM_PER_YEAR;
