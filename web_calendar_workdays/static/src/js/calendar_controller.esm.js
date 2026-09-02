/** @odoo-module **/
/* Copyright 2026 ForgeFlow S.L. (https://www.forgeflow.com)
 * License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

import {CalendarController} from "@web/views/calendar/calendar_controller";
import {_lt} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";

const WORK_SCALE_LABELS = {
    work_week: _lt("Work Week"),
    work_month: _lt("Work Month"),
};

const WORK_SCALE_TO_BASE = {
    work_week: "week",
    work_month: "month",
};

patch(CalendarController.prototype, "web_calendar_workdays.CalendarController", {
    get scaleLabels() {
        return {
            ...this._super(...arguments),
            ...WORK_SCALE_LABELS,
        };
    },
    async setDate(move) {
        const scale = this.model.scale;
        const baseScale = WORK_SCALE_TO_BASE[scale];
        if (!baseScale || move === "today") {
            return this._super(move);
        }
        let date = null;
        if (move === "next") {
            date = this.model.date.plus({[`${baseScale}s`]: 1});
        } else if (move === "previous") {
            date = this.model.date.minus({[`${baseScale}s`]: 1});
        }
        if (date) {
            await this.model.load({date});
        }
    },
});
