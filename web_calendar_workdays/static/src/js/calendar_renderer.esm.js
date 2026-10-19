/** @odoo-module **/
/* Copyright 2026 ForgeFlow S.L. (https://www.forgeflow.com)
 * License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

import {CalendarCommonRenderer} from "@web/views/calendar/calendar_common/calendar_common_renderer";
import {CalendarRenderer} from "@web/views/calendar/calendar_renderer";

Object.assign(CalendarRenderer.components, {
    work_week: CalendarCommonRenderer,
    work_month: CalendarCommonRenderer,
});
