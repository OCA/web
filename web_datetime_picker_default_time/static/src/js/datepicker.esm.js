/* Copyright 2024 Camptocamp
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl) */
import {DateTimePicker} from "@web/core/datetime/datetime_picker";
import {DateTimePickerPopover} from "@web/core/datetime/datetime_picker_popover";
import {patch} from "@web/core/utils/patch";
const {DateTime} = luxon;

/**
 * @typedef {import("@web/core/datetime/datetime_picker").DateTimePickerProps & {
 *   defaultTime?: { hour: number, minute: number, second: number },
 *   defaultStartTime?: { hour: number, minute: number, second: number },
 *   defaultEndTime?: { hour: number, minute: number, second: number },
 * }} DateTimePickerProps
 */

patch(DateTimePicker.prototype, {
    /**
     * @param {DateTimePickerProps} props
     */
    onPropsUpdated(props) {
        super.onPropsUpdated(props);

        const timeValues = this.values.map((val, index) =>
            this.getCustomTimeValues(val, index)
        );

        if (props.range) {
            this.state.timeValues = timeValues;
        } else {
            this.state.timeValues = [];
            this.state.timeValues[props.focusedDateIndex] =
                timeValues[props.focusedDateIndex];
        }

        this.adjustFocus(this.values, props.focusedDateIndex);
        this.handle12HourSystem();
        this.state.timeValues = this.state.timeValues.map((timeValue) =>
            timeValue.map(String)
        );
    },

    getCustomTimeValues(val, index) {
        const defaultTime =
            this.props.defaultTime || this.props.defaultStartTime || DateTime.local();
        const defaultEndTime =
            this.props.defaultEndTime || DateTime.local().plus({hour: 1});

        const timeSource = index === 1 ? val || defaultEndTime : val || defaultTime;

        return [timeSource.hour, timeSource.minute || 0, timeSource.second || 0];
    },
});

DateTimePicker.props = {
    ...DateTimePicker.props,
    defaultTime: {
        type: Object,
        shape: {
            hour: Number,
            minute: Number,
            second: Number,
        },
        optional: true,
    },
    defaultStartTime: {
        type: Object,
        shape: {
            hour: Number,
            minute: Number,
            second: Number,
        },
        optional: true,
    },
    defaultEndTime: {
        type: Object,
        shape: {
            hour: Number,
            minute: Number,
            second: Number,
        },
        optional: true,
    },
};

DateTimePickerPopover.props.pickerProps.shape = DateTimePicker.props;
