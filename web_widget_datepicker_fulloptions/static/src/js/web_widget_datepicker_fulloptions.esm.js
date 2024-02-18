/* @odoo-module */

import {DatePicker} from "@web/core/datepicker/datepicker";

Object.assign(DatePicker.defaultProps, {
    buttons: {
        showClear: true,
        showClose: true,
        showToday: true,
    },
});
