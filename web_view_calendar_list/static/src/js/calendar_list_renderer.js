odoo.define("web_view_calendar_list.CalendarListRenderer", function (require) {
    "use strict";

    const CalendarRenderer = require("web.CalendarRenderer");
    const core = require("web.core");
    const _t = core._t;

    return CalendarRenderer.extend({
        _getFullCalendarOptions: function (fcOptions) {
            var self = this;
            return this._super(
                _.extend({}, fcOptions, {
                    viewRender: function (view) {
                        // Compute mode from view.name which is either 'month',
                        // 'agendaWeek' or 'agendaDay'
                        var mode =
                            view.name === "listMonth"
                                ? "month"
                                : view.name === "listWeek"
                                ? "week"
                                : "day";
                        // Compute title: in week mode, display the week number
                        var title =
                            mode === "week"
                                ? _t("Week ") + view.intervalStart.week()
                                : view.title;
                        self.trigger_up("viewUpdated", {
                            mode: mode,
                            title: title,
                        });
                    },
                    views: {
                        listDay: {
                            columnHeaderFormat: "LL",
                        },
                        listWeek: {
                            columnHeaderFormat: "ddd D",
                        },
                        listMonth: {
                            columnHeaderFormat: "dddd",
                        },
                    },
                    eventRender: function (info) {
                        var event = info.event;
                        var element = $(info.el);
                        element.attr("data-event-id", event.id);
                        var $render = $(self._eventRender(event));
                        element.find(".fc-list-item-title").html($render.html());
                        element.addClass($render.attr("class"));
                        var color = self.getColor(event.extendedProps.color_index);
                        if (typeof color === "number") {
                            element
                                .find(".fc-event-dot")
                                .addClass(_.str.sprintf("o_calendar_color_%s", color));
                        } else {
                            element
                                .find(".fc-event-dot")
                                .addClass("o_calendar_color_1");
                        }
                        if (typeof color === "string") {
                            element
                                .find(".fc-event-dot")
                                .css("background-color", color);
                        }
                        // Add background if doesn't exist
                        if (!element.find(".fc-bg").length) {
                            element
                                .find(".fc-content")
                                .after($("<div/>", {class: "fc-bg"}));
                        }
                        // On double click, edit the event
                        element.on("dblclick", function () {
                            self.trigger_up("edit_event", {id: event.id});
                        });
                    },
                    plugins: ["list"],
                    isRTL: _t.database.parameters.direction === "rtl",
                })
            );
        },
    });
});
