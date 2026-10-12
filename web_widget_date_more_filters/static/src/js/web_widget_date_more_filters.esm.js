/** @odoo-module **/
/* Copyright 2024 OpenStudio
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

import * as dates from "@web/search/utils/dates";
import {serializeDate, serializeDateTime} from "@web/core/l10n/dates";
import {Domain} from "@web/core/domain";
import {SearchModel} from "@web/search/search_model";
import {_lt} from "@web/core/l10n/translation";
import {localization} from "@web/core/l10n/localization";
import {patch} from "@web/core/utils/patch";

/* Add some periods to the date filter of the web client: days, weeks and
sliding windows (the ones of the core are months, quarters and years).
The functions of the client are patched instead of being replaced, so that
the other modules extending them keep working. */

const {DateTime} = luxon;

/**
 * Periods added by this module:
 * - Today, Yesterday (granularity "day"),
 * - This week, Last week (granularity "week"),
 * - Last 7/30/365 days: sliding windows of exactly N days, ending on the
 *   reference day.
 */
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
        plusParam: {},
        minusParams: {
            global: {weeks: 1},
        },
    },
    last_7_days: {
        id: "last_7_days",
        groupNumber: 4,
        description: _lt("Last 7 days"),
        granularity: "day",
        plusParam: {},
        minusParams: {
            leftDate: {days: 7},
        },
    },
    last_30_days: {
        id: "last_30_days",
        groupNumber: 4,
        description: _lt("Last 30 days"),
        granularity: "day",
        plusParam: {},
        minusParams: {
            leftDate: {days: 30},
        },
    },
    last_365_days: {
        id: "last_365_days",
        groupNumber: 4,
        description: _lt("Last 365 days"),
        granularity: "day",
        plusParam: {},
        minusParams: {
            leftDate: {days: 365},
        },
    },
};

const NEW_OPTION_IDS = new Set(Object.keys(NEW_OPTIONS));

// The options are added to the table of the web client, which is never
// replaced: the modules extending it keep their own options.
Object.assign(dates.PERIOD_OPTIONS, NEW_OPTIONS);

// PER_YEAR holds the number of units of a year, used to shift a period of
// whole years. The client only knows exact ratios (12 months, 4 quarters):
// a year is 365 or 366 days and 52 or 53 ISO weeks. PER_YEAR is a plain
// object of the client, shared by every date filter of the page: the real
// numbers of the current year are used.
Object.assign(dates.PER_YEAR, {
    day: DateTime.local(DateTime.now().year, 12, 31).ordinal,
    week: DateTime.local(DateTime.now().year, 12, 28).weekNumber,
});

/* Number of days (or weeks) covered by a sliding window option, 1 by default. */
function _windowWidth(option, unit) {
    const leftDate = option.minusParams && option.minusParams.leftDate;
    return leftDate && leftDate[unit] ? leftDate[unit] : 1;
}

/* Description of a period: the label of its option, completed with the year it
belongs to, and with its own dates when it is compared to another period. */
function _getRangeDescription(params) {
    const {
        comparisonOptionId,
        date,
        granularity,
        leftDate,
        minusParams,
        optionDescription,
        referenceMoment,
        rightDate,
    } = params;
    const relative = comparisonOptionId;
    const method = localization.direction === "rtl" ? "push" : "unshift";
    let descriptions = null;
    if (granularity === "day") {
        if (minusParams && minusParams.leftDate) {
            // A sliding window is described by its own label, and by its
            // dates when it is compared to another period.
            descriptions = relative
                ? [
                      `${_lt("From Date")} ${leftDate.toFormat("dd LLL yyyy")} ${_lt(
                          "Until"
                      )} ${rightDate.toFormat("dd LLL yyyy")}`,
                  ]
                : [optionDescription.toString()];
        } else if (date.hasSame(referenceMoment, "day")) {
            descriptions = [date.toFormat("yyyy")];
            descriptions[method](_lt("Today").toString());
        } else if (date.hasSame(referenceMoment.minus({days: 1}), "day")) {
            descriptions = [date.toFormat("yyyy")];
            descriptions[method](_lt("Yesterday").toString());
        } else {
            descriptions = [date.toFormat("dd LLL yyyy")];
        }
    } else if (granularity === "week") {
        if (!relative && date.hasSame(referenceMoment, "week")) {
            descriptions = [date.toFormat("yyyy")];
            descriptions[method](_lt("This week").toString());
        } else if (
            !relative &&
            date.hasSame(referenceMoment.minus({weeks: 1}), "week")
        ) {
            descriptions = [date.toFormat("yyyy")];
            descriptions[method](_lt("Last week").toString());
        } else {
            // A week of another year, or a compared week, is described by its
            // ISO number and year: the calendar year of the same date would be
            // wrong around the new year.
            descriptions = [`${_lt("Week")}: ${date.weekNumber} - ${date.weekYear}`];
        }
    } else {
        descriptions = [date.toFormat("yyyy")];
        if (granularity === "month") {
            descriptions[method](date.toFormat("MMMM"));
        } else if (granularity === "quarter") {
            descriptions[method](dates.QUARTERS[date.quarter].description.toString());
        }
    }
    return descriptions.join(" ");
}

/* The months covered by a quarter which is selected along with months are
added to the selection, so that the comparison covers the whole quarter. */
function _addQuartersMonths(selectedOptions, quarters) {
    for (const quarter of quarters) {
        for (const month of dates.QUARTERS[quarter].coveredMonths) {
            const monthOption = selectedOptions.month.find(
                (option) => option.setParam.month === month
            );
            if (!monthOption) {
                selectedOptions.month.push({
                    setParam: {month},
                    granularity: "month",
                });
            }
        }
    }
}

const _getSetParam = dates.getSetParam;

/* The helpers below are the computation layer of the module. They are only
reached through this module object: the client transpiles the named imports
as destructuring (`const {getPeriodOptions} = require(...)`), so a module
which imported one of them by name keeps the original reference. The
SearchModel methods which call them are patched for that reason, and call
them through `dates`. */
patch(dates, "web_widget_date_more_filters", {
    getSetParam(periodOption, referenceMoment) {
        const {granularity, plusParam} = periodOption;
        if (granularity === "day") {
            // Luxon keeps the month and the year of the reference when only
            // "day" is set: the day alone would target the wrong date as soon
            // as the offset crosses a month boundary.
            const date = referenceMoment.plus(plusParam || {});
            return {day: date.day, month: date.month};
        }
        if (granularity === "week") {
            // Luxon has no "week" setter: the ISO week number is the unit
            const date = referenceMoment.plus(plusParam || {});
            return {weekNumber: date.weekNumber};
        }
        return _getSetParam(...arguments);
    },

    getSelectedOptions(referenceMoment, selectedOptionIds) {
        const selectedOptions = {year: []};
        for (const optionId of selectedOptionIds) {
            const option = dates.PERIOD_OPTIONS[optionId];
            const {granularity, minusParams, description} = option;
            if (!selectedOptions[granularity]) {
                selectedOptions[granularity] = [];
            }
            // The offset and the label of the option are carried to its range
            selectedOptions[granularity].push({
                granularity,
                setParam: dates.getSetParam(option, referenceMoment),
                minusParams,
                description,
            });
        }
        return selectedOptions;
    },

    constructDateDomain(
        referenceMoment,
        fieldName,
        fieldType,
        selectedOptionIds,
        comparisonOptionId
    ) {
        let plusParam = null;
        let selectedOptions = null;
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
        const otherOptions = [
            ...(selectedOptions.quarter || []),
            ...(selectedOptions.month || []),
            ...(selectedOptions.day || []),
            ...(selectedOptions.week || []),
        ];
        // An option of this module does not need a year: when none is
        // selected, its ranges are still built, with an empty year part.
        let yearOptions = selectedOptions.year;
        if (!yearOptions.length && otherOptions.length) {
            yearOptions = [{granularity: "year", setParam: {}}];
        }
        dates.sortPeriodOptions(yearOptions);
        dates.sortPeriodOptions(otherOptions);
        const ranges = [];
        for (const yearOption of yearOptions) {
            const constructRangeParams = {
                referenceMoment,
                fieldName,
                fieldType,
                plusParam,
                comparisonOptionId,
            };
            if (!otherOptions.length) {
                const {granularity, setParam} = yearOption;
                ranges.push(
                    dates.constructDateRange(
                        Object.assign({granularity, setParam}, constructRangeParams)
                    )
                );
                continue;
            }
            for (const option of otherOptions) {
                // Luxon refuses to mix weekYear/weekNumber with year
                const yearParam =
                    option.granularity === "week" && yearOption.setParam.year
                        ? {weekYear: yearOption.setParam.year}
                        : yearOption.setParam;
                const setParam = Object.assign({}, yearParam, option.setParam);
                const {granularity, minusParams, description} = option;
                ranges.push(
                    dates.constructDateRange(
                        Object.assign(
                            {granularity, setParam, minusParams, description},
                            constructRangeParams
                        )
                    )
                );
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
            minusParams,
            comparisonOptionId,
            description: optionDescription,
        } = params;
        if ("quarter" in setParam) {
            // Luxon does not consider the quarter key in setParam (like moment did)
            setParam.month = dates.QUARTERS[setParam.quarter].coveredMonths[0];
            delete setParam.quarter;
        }
        const globalMinus = (minusParams && minusParams.global) || {};
        const leftDateMinus = (minusParams && minusParams.leftDate) || null;
        const date = referenceMoment
            .set(setParam)
            .plus(plusParam || {})
            .minus(globalMinus);
        let leftDate = date.minus(leftDateMinus || {}).startOf(granularity);
        const rightDate = date.endOf(granularity);
        if (leftDateMinus) {
            // Both bounds are inclusive: skip one day so that a window of N
            // days really covers N days.
            leftDate = leftDate.plus({days: 1});
        }
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
        const description = _getRangeDescription({
            comparisonOptionId,
            date,
            granularity,
            leftDate,
            minusParams,
            optionDescription,
            referenceMoment,
            rightDate,
        });
        return {domain, description};
    },

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
        const granularities = ["month", "quarter", "day", "week"];
        const globalGranularity =
            granularities.find((granularity) => selectedOptions[granularity]) || "year";
        const granularityFactor = dates.PER_YEAR[globalGranularity];
        // A period of this module is not anchored on a year: without any
        // year selected, the years part has to cancel out (Math.min() of an
        // empty list is Infinity, which would make the whole shift a NaN).
        const years = selectedOptions.year.map((o) => o.setParam.year);
        const yearMin = years.length ? Math.min(...years) : 0;
        const yearMax = years.length ? Math.max(...years) : 0;
        let optionMin = 0;
        let optionMax = 0;
        if (selectedOptions.quarter) {
            const quarters = selectedOptions.quarter.map((o) => o.setParam.quarter);
            if (globalGranularity === "month") {
                delete selectedOptions.quarter;
                _addQuartersMonths(selectedOptions, quarters);
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
        if (selectedOptions.day) {
            // The client shifts a period of one day: a sliding window has to
            // be shifted of the whole span it covers.
            const widths = selectedOptions.day.map((o) => _windowWidth(o, "days"));
            optionMin = 0;
            optionMax = Math.max(...widths) - 1;
        }
        const num =
            -1 + granularityFactor * (yearMin - yearMax) + optionMin - optionMax;
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
    },

    getPeriodOptions(referenceMoment) {
        const options = [];
        for (const option of Object.values(dates.PERIOD_OPTIONS)) {
            const {id, groupNumber, granularity, plusParam} = option;
            let description = null;
            let defaultYear = null;
            switch (granularity) {
                case "quarter":
                    description = option.description.toString();
                    defaultYear = referenceMoment.set(option.setParam).year;
                    break;
                case "month":
                case "year": {
                    const date = referenceMoment.plus(plusParam || {});
                    description = date.toFormat(option.format);
                    defaultYear = date.year;
                    break;
                }
                default:
                    // Day and week: the label of the option and the year of
                    // the shifted date, whose offset may cross a year boundary
                    description = option.description.toString();
                    defaultYear = referenceMoment.plus(plusParam || {}).year;
                    break;
            }
            options.push({
                id,
                groupNumber,
                description,
                defaultYear,
                setParam: dates.getSetParam(option, referenceMoment),
            });
        }
        return options.map(({id, groupNumber, description, defaultYear}) => ({
            id,
            groupNumber,
            description,
            // The option of type 'year' of the period, as the client looks it
            // up. A period of this module is complete on its own: it is not
            // given one (the client adds the year it finds here to the query).
            defaultYearId: NEW_OPTION_IDS.has(id)
                ? undefined
                : (
                      options.find(
                          (option) =>
                              option.setParam && option.setParam.year === defaultYear
                      ) || {}
                  ).id,
        }));
    },
});

/* The methods of the client which use the helpers above are patched: they
call the helpers they imported at load time, and the options of a date
filter are computed once, in the constructor of the model. */
patch(SearchModel.prototype, "web_widget_date_more_filters", {
    getSearchItems(predicate) {
        this.optionGenerators = dates.getPeriodOptions(this.referenceMoment);
        return this._super(predicate);
    },

    _getDateFilterDomain(dateFilter, generatorIds, key = "domain") {
        const {fieldName, fieldType} = dateFilter;
        const range = dates.constructDateDomain(
            this.referenceMoment,
            fieldName,
            fieldType,
            generatorIds
        );
        return range[key];
    },

    getFullComparison() {
        // Reproduced from the client: its ranges are computed with the
        // helpers it imported (see the note above the patch of `dates`).
        let searchItem = null;
        for (const queryElem of this.query.slice().reverse()) {
            const item = this.searchItems[queryElem.searchItemId];
            if (item.type === "comparison") {
                searchItem = item;
                break;
            } else if (item.type === "favorite" && item.comparison) {
                searchItem = item;
                break;
            }
        }
        if (!searchItem) {
            return null;
        } else if (searchItem.type === "favorite") {
            return searchItem.comparison;
        }
        const {dateFilterId, comparisonOptionId} = searchItem;
        const {
            fieldName,
            fieldType,
            description: fieldDescription,
        } = this.searchItems[dateFilterId];
        const generatorIds = this._getSelectedGeneratorIds(dateFilterId);
        const range = dates.constructDateDomain(
            this.referenceMoment,
            fieldName,
            fieldType,
            generatorIds
        );
        const comparisonRange = dates.constructDateDomain(
            this.referenceMoment,
            fieldName,
            fieldType,
            generatorIds,
            comparisonOptionId
        );
        return {
            comparisonId: comparisonOptionId,
            fieldName,
            fieldDescription,
            range: range.domain.toList(),
            rangeDescription: range.description,
            comparisonRange: comparisonRange.domain.toList(),
            comparisonRangeDescription: comparisonRange.description,
        };
    },

    /* The client adds a year to the query as soon as an option of a date
    filter is selected without one, because its own options (months,
    quarters) are meaningless without a year. The options of this module
    are complete on their own: they are selected on their own, and removing
    a year does not drop them. */
    toggleDateFilter(searchItemId, generatorId) {
        this.optionGenerators = dates.getPeriodOptions(this.referenceMoment);
        const searchItem = this.searchItems[searchItemId];
        if (searchItem.type !== "dateFilter") {
            return this._super(...arguments);
        }
        const generatorIds = generatorId
            ? [generatorId]
            : searchItem.defaultGeneratorIds;
        for (const id of generatorIds) {
            const index = this.query.findIndex(
                (queryElem) =>
                    queryElem.searchItemId === searchItemId &&
                    "generatorId" in queryElem &&
                    queryElem.generatorId === id
            );
            if (index >= 0) {
                this.query.splice(index, 1);
                if (!dates.yearSelected(this._getSelectedGeneratorIds(searchItemId))) {
                    // The case where the removed option was the last one of
                    // type 'year': the options of type 'month' or 'quarter'
                    // do not make sense without a year. The options of this
                    // module do: they are kept.
                    this.query = this.query.filter(
                        (queryElem) =>
                            queryElem.searchItemId !== searchItemId ||
                            NEW_OPTION_IDS.has(queryElem.generatorId)
                    );
                }
            } else {
                this.query.push({searchItemId, generatorId: id});
                if (!dates.yearSelected(this._getSelectedGeneratorIds(searchItemId))) {
                    const {defaultYearId} = this.optionGenerators.find(
                        (o) => o.id === id
                    );
                    if (defaultYearId) {
                        this.query.push({
                            searchItemId,
                            generatorId: defaultYearId,
                        });
                    }
                }
            }
        }
        this._checkComparisonStatus();
        this._notify();
    },
});
