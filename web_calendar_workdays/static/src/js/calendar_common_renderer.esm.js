/** @odoo-module **/
/* Copyright 2026 ForgeFlow S.L. (https://www.forgeflow.com)
 * License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

import {CalendarCommonRenderer} from "@web/views/calendar/calendar_common/calendar_common_renderer";
import {patch} from "@web/core/utils/patch";

// FullCalendar weekday numbering: 0 = Sunday, 6 = Saturday.
const WEEKEND_DAYS = [0, 6];

const WORK_SCALE_TO_FC_VIEW = {
    work_week: "timeGridWeek",
    work_month: "dayGridMonth",
};

const WORK_SCALE_TO_HEADER_FORMAT = {
    work_week: "EEE d",
    work_month: "EEEE",
};

const SHORT_WORK_SCALE_TO_HEADER_FORMAT = {
    work_week: "EEE d",
    work_month: "EEE",
};

const WORK_SCALE_TO_BASE = {
    work_week: "week",
    work_month: "month",
};

function withBaseScale(model, callback) {
    const scale = model.meta.scale;
    const baseScale = WORK_SCALE_TO_BASE[scale];
    if (!baseScale) {
        return callback();
    }
    model.meta.scale = baseScale;
    try {
        return callback();
    } finally {
        model.meta.scale = scale;
    }
}

patch(
    CalendarCommonRenderer.prototype,
    "web_calendar_workdays.CalendarCommonRenderer",
    {
        get options() {
            const options = this._super(...arguments);
            const scale = this.props.model.scale;
            if (WORK_SCALE_TO_FC_VIEW[scale]) {
                options.defaultView = WORK_SCALE_TO_FC_VIEW[scale];
                options.columnHeaderFormat = this.env.isSmall
                    ? SHORT_WORK_SCALE_TO_HEADER_FORMAT[scale]
                    : WORK_SCALE_TO_HEADER_FORMAT[scale];
                options.hiddenDays = WEEKEND_DAYS;
            }
            return options;
        },
        convertRecordToEvent(record) {
            return withBaseScale(this.props.model, () => this._super(record));
        },
        fcEventToRecord(event) {
            return withBaseScale(this.props.model, () => this._super(event));
        },
    }
);
