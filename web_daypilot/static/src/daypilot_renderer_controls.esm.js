// eslint-disable-next-line jsdoc/check-tag-names -- odoo-module is an Odoo-specific tag for module loading
/** @odoo-module **/

import {Component, useState} from "@odoo/owl";
import {DateTimePicker} from "@web/core/datetime/datetime_picker";
import {formatDate} from "@web/core/l10n/dates";
import {pick} from "@web/core/utils/objects";

export class DayPilotRendererControls extends Component {
    static template = "web_daypilot.DayPilotRendererControls";
    static components = {
        DatePicker: DateTimePicker,
    };
    static props = ["model"];

    setup() {
        this.model = this.props.model;

        // Period used when navigating (prev/next/today).
        this.navRange = this.model.metaData.defaultRange || "day";

        // Initialize state with defaults
        const initialMetaData = this.model.metaData;
        this.state = useState({
            startDate:
                initialMetaData.startDate || luxon.DateTime.local().startOf("day"),
            stopDate: initialMetaData.stopDate || luxon.DateTime.local().endOf("day"),
            focusDate:
                initialMetaData.focusDate || luxon.DateTime.local().startOf("day"),
            showDatePicker: false,
        });
    }

    makeParams() {
        return pick(this.state, "startDate", "stopDate", "focusDate");
    }

    updateMetaData() {
        return this.model.fetchData(this.makeParams());
    }

    onTodayClicked() {
        this.state.focusDate = luxon.DateTime.local().startOf("day");
        Object.assign(
            this.state,
            this.model.getRangeFromDate(this.navRange, this.state.focusDate)
        );
        this.updateMetaData();
    }

    selectRange(direction) {
        const sign = direction === "next" ? 1 : -1;
        const {focusDate} = this.state;
        const newFocusDate = focusDate.plus({[this.navRange]: sign});
        const range = this.model.getRangeFromDate(this.navRange, newFocusDate);
        Object.assign(this.state, range);
        this.updateMetaData();
    }

    onDateSelected(date) {
        this.state.focusDate = date.startOf("day");
        // Calculate range centered on selected date
        const range = this.model.getRangeFromDate(this.navRange, this.state.focusDate);
        Object.assign(this.state, range);
        this.updateMetaData();
        this.state.showDatePicker = false;
    }

    toggleDatePicker() {
        this.state.showDatePicker = !this.state.showDatePicker;
    }

    get dateHeader() {
        const {focusDate, startDate, stopDate} = this.state;
        // Prefer the focused day for day-based navigation
        const date = focusDate || startDate;
        if (!date) {
            return "";
        }
        if (this.navRange === "day") {
            return formatDate(date, {format: "cccc, d MMMM yyyy"});
        }
        if (!startDate || !stopDate) {
            return formatDate(date, {format: "d MMMM yyyy"});
        }
        const startStr = formatDate(startDate, {format: "d MMM yyyy"});
        const endStr = formatDate(stopDate, {format: "d MMM yyyy"});
        return startStr === endStr ? startStr : `${startStr} - ${endStr}`;
    }

    get today() {
        return formatDate(luxon.DateTime.local(), {format: "MMM d"});
    }

    get datePickerProps() {
        return {
            type: "date",
            showWeekNumbers: false,
            maxPrecision: "days",
            daysOfWeekFormat: "narrow",
            onSelect: this.onDateSelected.bind(this),
            value: this.state.focusDate,
        };
    }
}
