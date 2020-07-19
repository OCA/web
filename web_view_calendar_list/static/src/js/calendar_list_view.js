odoo.define('web_view_calendar_list.CalendarListView', function (require) {
    "use strict";

    var CalendarView = require('web.CalendarView');
    var core = require('web.core');
    var CalendarListController = require(
        'web_view_calendar_list.CalendarListController');
    var CalendarListModel = require('web_view_calendar_list.CalendarListModel');
    var CalendarListRenderer = require(
        'web_view_calendar_list.CalendarListRenderer');
    var view_registry = require('web.view_registry');

    var _lt = core._lt;

    var CalendarListView = CalendarView.extend({
        display_name: _lt('Calendar List'),
        icon: 'fa-calendar-check-o',
        config: {
            Model: CalendarListModel,
            Controller: CalendarListController,
            Renderer: CalendarListRenderer,
        },
    });

    view_registry
        .add('calendar_list', CalendarListView);

    return CalendarListView;

});
