/** @odoo-module **/
/* Copyright 2026 ForgeFlow S.L. (https://www.forgeflow.com)
 * License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

import {CalendarModel} from "@web/views/calendar/calendar_model";
import {patch} from "@web/core/utils/patch";

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

patch(CalendarModel.prototype, "web_calendar_workdays.CalendarModel", {
    computeRange() {
        return withBaseScale(this, () => this._super(...arguments));
    },
    buildRawRecord(partialRecord, options = {}) {
        return withBaseScale(this, () => this._super(partialRecord, options));
    },
    makeContextDefaults(rawRecord) {
        return withBaseScale(this, () => this._super(rawRecord));
    },
});
