/** @odoo-module **/
/* Copyright 2026 Heligrafics Fotogrametria S.L.
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

import {Component, useState} from "@odoo/owl";
import {DateTimeInput} from "@web/core/datetime/datetime_input";
import {Dialog} from "@web/core/dialog/dialog";
import {_t} from "@web/core/l10n/translation";

const {DateTime} = luxon;

export const DEFAULT_DATE_RANGE = "today";
export const DEFAULT_MAX_DAYS = 60;

/**
 * Returns the start and end of a predefined range, in the user's timezone.
 *
 * @param {String} dateRange "today", "yesterday" or "last_7_days"
 * @returns {{fromDate: DateTime, untilDate: DateTime}}
 */
export function getRangeDates(dateRange) {
    const now = DateTime.local();
    switch (dateRange) {
        case "yesterday":
            return {
                fromDate: now.minus({days: 1}).startOf("day"),
                untilDate: now.minus({days: 1}).endOf("day"),
            };
        case "last_7_days":
            return {
                fromDate: now.minus({days: 7}).startOf("day"),
                untilDate: now.endOf("day"),
            };
        default:
            return {fromDate: now.startOf("day"), untilDate: now.endOf("day")};
    }
}

export class DateRangeDialog extends Component {
    static template = "web_list_date_range_required.DateRangeDialog";
    static components = {Dialog, DateTimeInput};
    static props = {
        close: Function,
        save: Function,
        dateRange: {type: String, optional: true},
        fromDate: {type: DateTime, optional: true},
        untilDate: {type: DateTime, optional: true},
        fieldType: {type: String, optional: true},
        maxDays: {type: Number, optional: true},
    };
    static defaultProps = {
        dateRange: DEFAULT_DATE_RANGE,
        fieldType: "datetime",
        maxDays: DEFAULT_MAX_DAYS,
    };

    setup() {
        this.title = _t("Select Date Range");
        const {dateRange, fromDate, untilDate} = this.props;
        this.state = useState({
            dateRange,
            ...(dateRange === "custom" && fromDate && untilDate
                ? {fromDate, untilDate}
                : getRangeDates(dateRange)),
            error: null,
        });
    }

    get rangeOptions() {
        return [
            {value: "today", label: _t("Today")},
            {value: "yesterday", label: _t("Yesterday")},
            {value: "last_7_days", label: _t("Last 7 Days")},
            {value: "custom", label: _t("Custom")},
        ];
    }

    checkRange() {
        const {fromDate, untilDate} = this.state;
        if (fromDate > untilDate) {
            this.state.error = _t("The start date cannot be after the end date.");
        } else if (untilDate.diff(fromDate, "days").days > this.props.maxDays) {
            this.state.error = _t(
                "The maximum allowed range is %s days.",
                this.props.maxDays
            );
        } else {
            this.state.error = null;
        }
    }

    onChangeDateRange(dateRange) {
        this.state.dateRange = dateRange;
        if (dateRange !== "custom") {
            Object.assign(this.state, getRangeDates(dateRange));
        }
        this.checkRange();
    }

    onChangeFromDate(fromDate) {
        if (fromDate) {
            this.state.fromDate =
                this.props.fieldType === "date" ? fromDate.startOf("day") : fromDate;
        }
        this.checkRange();
    }

    onChangeUntilDate(untilDate) {
        if (untilDate) {
            this.state.untilDate =
                this.props.fieldType === "date" ? untilDate.endOf("day") : untilDate;
        }
        this.checkRange();
    }

    onSearch() {
        const {dateRange, fromDate, untilDate} = this.state;
        this.props.save({dateRange, fromDate, untilDate});
        this.props.close();
    }
}
