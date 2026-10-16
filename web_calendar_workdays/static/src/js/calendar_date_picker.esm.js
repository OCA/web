/** @odoo-module **/
/* Copyright 2026 ForgeFlow S.L. (https://www.forgeflow.com)
 * License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

import {CalendarDatePicker} from "@web/views/calendar/date_picker/calendar_date_picker";
import {patch} from "@web/core/utils/patch";

const WORK_SCALE_TO_BASE = {
    work_week: "week",
    work_month: "month",
};

patch(CalendarDatePicker.prototype, "web_calendar_workdays.CalendarDatePicker", {
    highlight() {
        const model = this.props.model;
        const scale = model.meta.scale;
        const baseScale = WORK_SCALE_TO_BASE[scale];
        if (!baseScale) {
            return this._super(...arguments);
        }
        model.meta.scale = baseScale;
        try {
            return this._super(...arguments);
        } finally {
            model.meta.scale = scale;
        }
    },
});
