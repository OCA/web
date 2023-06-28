/* Copyright 2021 Tecnativa - Jairo Llopis
 * License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

odoo.define("web_calendar_slot_duration.CalendarController", function (require) {
    var CalendarController = require("web.CalendarController");

    CalendarController.include({
        /**
         * @override
         */
        _getFullCalendarOptions: function () {
            var result = this._super.apply(this, arguments);
            result.slotDuration =
                this.model.get(this.handle, {raw: true}).context
                    .calendar_slot_duration ||
                result.slotDuration ||
                "00:30:00";
            return result;
        },
    });

    return CalendarController;
});
