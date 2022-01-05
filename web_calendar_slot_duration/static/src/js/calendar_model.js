/* Copyright 2021 Tecnativa - Jairo Llopis
 * License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

odoo.define("web_calendar_slot_duration.CalendarModel", function (require) {
    "use strict";

    var CalendarModel = require("web.CalendarModel");

    CalendarModel.include({
        /**
         * @override
         */
        _getFullCalendarOptions: function () {
            var result = this._super.call(this, arguments);
            result.slotDuration =
                this.data.context.calendar_slot_duration ||
                result.slotDuration ||
                "00:30:00";
            return result;
        },
    });
});
