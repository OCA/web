/* Copyright 2024 Camptocamp
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl) */

import {useRef} from "@odoo/owl";
import {localization} from "@web/core/l10n/localization";
import {patch} from "@web/core/utils/patch";
import {
    DateTimeField,
    dateRangeField,
    dateTimeField,
} from "@web/views/fields/datetime/datetime_field";
import {
    listDateRangeField,
    listDateTimeField,
} from "@web/views/fields/datetime/list_datetime_field";
const {DateTime} = luxon;
/**
 * @typedef {import("./datepicker.esm").DateTimePickerProps} DateTimePickerProps
 */

patch(DateTimeField.prototype, {
    setup() {
        super.setup();

        this.state.defaultTime = this.defaultTime;
        this.state.defaultStartTime = this.defaultStartTime;
        this.state.defaultEndTime = this.defaultEndTime;
        this.userInputValue = "";
        this.endDateRef = useRef("end-date");

        // UserInputIndex is used to determine which input the user is typing in
        // 0 = start date, 1 = end date
        this.userInputIndex = 1;
    },

    // Getter
    get defaultTime() {
        if (typeof this.props.defaultTime === "string") {
            if (!this.props.record.data[this.props.defaultTime]) {
                return "";
            }
            if (typeof this.props.record.data[this.props.defaultTime] === "string") {
                return JSON.parse(this.props.record.data[this.props.defaultTime]);
            }
            return this.props.record.data[this.props.defaultTime];
        }
        return this.props.defaultTime;
    },

    get defaultStartTime() {
        if (typeof this.props.defaultStartTime === "string") {
            if (!this.props.record.data[this.props.defaultStartTime]) {
                return "";
            }
            if (
                typeof this.props.record.data[this.props.defaultStartTime] === "string"
            ) {
                return JSON.parse(this.props.record.data[this.props.defaultStartTime]);
            }
            return this.props.record.data[this.props.defaultStartTime];
        }
        return this.props.defaultStartTime;
    },

    get defaultEndTime() {
        if (typeof this.props.defaultEndTime === "string") {
            if (!this.props.record.data[this.props.defaultEndTime]) {
                return "";
            }
            if (typeof this.props.record.data[this.props.defaultEndTime] === "string") {
                return JSON.parse(this.props.record.data[this.props.defaultEndTime]);
            }
            return this.props.record.data[this.props.defaultEndTime];
        }
        return this.props.defaultEndTime;
    },

    // OVERRIDE:remove automatic date calculation
    async addDate(valueIndex) {
        this.state.focusedDateIndex = valueIndex;
        this.state.value = this.values;
        this.state.range = true;

        this.openPicker(valueIndex);
    },
    onInput(ev) {
        super.onInput(...arguments);
        this.userInputValue = arguments[0].target.value;
        if (this.state.range) {
            this.userInputIndex = ev.target == this.endDateRef.el ? 1 : 0;
        }
    },
    getRecordValue() {
        let values = super.getRecordValue(...arguments);
        if (this.userInputValue) {
            if (Array.isArray(values)) {
                values[this.userInputIndex] = this.setRangeTimeValue(
                    values[this.userInputIndex]
                );
            } else {
                values = this.setTimeValue(values);
            }
        }
        return values;
    },
    isStrDate(input_string) {
        if (!input_string) {
            return false;
        }
        return input_string.trim().length == localization.dateFormat.length;
    },
    setRangeTimeValue(dateValue) {
        const default_start_time = this.defaultStartTime;
        const default_end_time = this.defaultEndTime;
        if (
            !default_start_time ||
            !default_end_time ||
            !dateValue ||
            !DateTime.isDateTime(dateValue)
        ) {
            return dateValue;
        }
        if (!this.isStrDate(this.userInputValue)) {
            return dateValue;
        }

        if (this.userInputIndex) {
            // End date
            const endDateValue = dateValue.set({
                hour: default_end_time.hour,
                minute: default_end_time.minute,
                second: default_end_time.second,
            });
            this.props.record.update({
                [this.endDateField]: endDateValue,
            });
            this.userInputValue = "";
            return endDateValue;
        }

        // Start date
        const startDateValue = dateValue.set({
            hour: default_start_time.hour,
            minute: default_start_time.minute,
            second: default_start_time.second,
        });
        this.props.record.update({
            [this.startDateField]: startDateValue,
        });
        this.userInputValue = "";
        return startDateValue;
    },
    setTimeValue(dateValue) {
        const default_time = this.defaultTime;
        if (!default_time || !dateValue || !DateTime.isDateTime(dateValue)) {
            return dateValue;
        }
        if (!this.isStrDate(this.userInputValue)) {
            return dateValue;
        }
        const newDateValue = dateValue.set({
            hour: default_time.hour,
            minute: default_time.minute,
            second: default_time.second,
        });
        this.props.record.update({
            [this.props.name]: newDateValue,
        });
        this.userInputValue = "";
        return newDateValue;
    },
});

DateTimeField.props = {
    ...DateTimeField.props,
    defaultTime: {
        type: [
            String,
            {
                type: Object,
                shape: {
                    hour: Number,
                    minute: Number,
                    second: Number,
                },
                optional: true,
            },
        ],
        optional: true,
    },
    defaultStartTime: {
        type: [
            String,
            {
                type: Object,
                shape: {
                    hour: Number,
                    minute: Number,
                    second: Number,
                },
                optional: true,
            },
        ],
        optional: true,
    },
    defaultEndTime: {
        type: [
            String,
            {
                type: Object,
                shape: {
                    hour: Number,
                    minute: Number,
                    second: Number,
                },
                optional: true,
            },
        ],
        optional: true,
    },
};

const superDateTimeExtractProps = dateTimeField.extractProps;
dateTimeField.extractProps = ({attrs, options}, dynamicInfo) => ({
    ...superDateTimeExtractProps({attrs, options}, dynamicInfo),
    defaultTime: options.defaultTime,
});

const superDateRangeExtractProps = dateRangeField.extractProps;
dateRangeField.extractProps = ({attrs, options}, dynamicInfo) => ({
    ...superDateRangeExtractProps({attrs, options}, dynamicInfo),
    defaultStartTime: options.defaultStartTime,
    defaultEndTime: options.defaultEndTime,
});

const superListDateTimeExtractProps = listDateTimeField.extractProps;
listDateTimeField.extractProps = ({attrs, options}, dynamicInfo) => ({
    ...superListDateTimeExtractProps({attrs, options}, dynamicInfo),
    defaultTime: options.defaultTime,
});

const superListDateRangeExtractProps = listDateRangeField.extractProps;
listDateRangeField.extractProps = ({attrs, options}, dynamicInfo) => ({
    ...superListDateRangeExtractProps({attrs, options}, dynamicInfo),
    defaultStartTime: options.defaultStartTime,
    defaultEndTime: options.defaultEndTime,
});
