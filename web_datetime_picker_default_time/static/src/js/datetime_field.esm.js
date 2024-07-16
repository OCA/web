/** @odoo-module **/
/* Copyright 2024 Camptocamp
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl) */

import {DateTimeField} from "@web/views/fields/datetime/datetime_field";
import {patch} from "@web/core/utils/patch";

patch(DateTimeField.prototype, "DateTimeFieldDefaultTime", {
    get defaultTime() {
        if (typeof this.props.defaultTime === "string") {
            return this.props.record.data[this.props.defaultTime];
        }
        return this.props.defaultTime;
    },
});

DateTimeField.props = _.extend({}, DateTimeField.props, {
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
});

const super_extractProps = DateTimeField.extractProps;

DateTimeField.extractProps = ({attrs}) => {
    return {
        ...super_extractProps({attrs}),
        defaultTime: attrs.options.defaultTime,
    };
};
