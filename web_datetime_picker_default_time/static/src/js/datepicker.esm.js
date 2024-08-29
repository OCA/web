/** @odoo-module **/
/* Copyright 2024 Camptocamp
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl) */

import {DateTimePicker} from "@web/core/datepicker/datepicker";
import {patch} from "@web/core/utils/patch";
import {localization} from "@web/core/l10n/localization";

patch(DateTimePicker.prototype, "DateTimePickerDefaultTime", {
    onMounted() {
        this._super.apply(this, arguments);
        this.addPickerListener("change", ({date, oldDate}) => {
            const default_time = this.props.defaultTime;
            if (date && !oldDate && default_time) {
                // FIXME: Consider TZ
                date.set({
                    hour: default_time.hour,
                    minute: default_time.minute,
                    second: default_time.second,
                });
                window.$(this.rootRef.el).datetimepicker("date", date);
            }
        });
    },
    isStrDate(input_string) {
        return input_string.trim().length == localization.dateFormat.length;
    },
    customParseValue(input_value, options) {
        const default_time = this.props.defaultTime;
        let [res, error] = this.parseValueOriginal(input_value, options);
        if (default_time && this.isStrDate(input_value)) {
            const new_value = res.set({
                hour: default_time.hour,
                minute: default_time.minute,
                second: default_time.second,
            });
            res = new_value;
        }
        return [res, error];
    },
    initFormat() {
        this._super.apply(this, arguments);
        this.parseValueOriginal = this.parseValue;
        this.parseValue = this.customParseValue;
    },
});

DateTimePicker.props = _.extend({}, DateTimePicker.props, {
    defaultTime: {
        type: Object,
        shape: {
            hour: Number,
            minute: Number,
            second: Number,
        },
        optional: true,
    },
});
