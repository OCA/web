odoo.define("web_view_calendar_list.CalendarListView", function (require) {
    "use strict";

    var AbstractView = require("web.AbstractView");
    var CalendarView = require("web.CalendarView");
    var core = require("web.core");
    var CalendarListController = require("web_view_calendar_list.CalendarListController");
    var CalendarListModel = require("web_view_calendar_list.CalendarListModel");
    var CalendarListRenderer = require("web_view_calendar_list.CalendarListRenderer");
    var view_registry = require("web.view_registry");

    var _lt = core._lt;
    const scalesInfo = {
        day: "listDay",
        week: "listWeek",
        month: "listMonth",
    };
    const allowedScales = Object.keys(scalesInfo);

    var CalendarListView = CalendarView.extend({
        display_name: _lt("Calendar List"),
        icon: "fa-calendar-check-o",
        viewType: "calendar_list",
        config: _.extend(AbstractView.prototype.config, {
            Model: CalendarListModel,
            Controller: CalendarListController,
            Renderer: CalendarListRenderer,
        }),
        init: function () {
            this._super.apply(this, arguments);
            var scales = allowedScales;
            if (this.arch.attrs.scales) {
                scales = this.arch.attrs.scales
                    .split(",")
                    .filter((x) => allowedScales.includes(x));
            }
            this.controllerParams.scales = scales;
            this.rendererParams.scalesInfo = scalesInfo;
            this.loadParams.scales = scales;
            this.loadParams.scalesInfo = scalesInfo;
        },
    });

    view_registry.add("calendar_list", CalendarListView);

    return CalendarListView;
});
