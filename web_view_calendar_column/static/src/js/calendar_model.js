odoo.define('web_view_calendar_column.CalendarModel', function (require) {
    "use strict";

    var CalendarModel = require('web.CalendarModel');
    var session = require('web.session');
    var core = require('web.core');
    var qweb = core.qweb;
    var _t = core._t;

    CalendarModel.include({
        load: function (params) {
            this.fieldColumn = params.fieldColumn;
            this.forceColumns = params.forceColumns;
            return this._super.apply(this, arguments);
        },
        _loadCalendar: function () {
            var self = this;
            return this._super.apply(this, arguments).then(function () {
                self._compute_columns(self.data, self.data.data);
            });
        },
        _compute_columns: function (element, events) {
            if (this.fieldColumn && this.forceColumns) {
                this.data.columns = this.forceColumns;
            }
            else if (this.fieldColumn) {
                var fieldName = this.fieldColumn;
                var columns = {}
                var elements = events;
                _.each(events, function (event) {
                    var value = event.record[fieldName];
                    var key = _.isArray(value) ? value[0] : value;
                    columns[key] = _.isArray(value) ? value[1] : value;
                });
                this.data.columns = columns;
            }
        },
        _recordToCalendarEvent: function (evt) {
            var result = this._super.apply(this, arguments);
            var value = evt[this.fieldColumn];
            result.resourceId = _.isArray(value) ? value[0] : value;
            return result;
        },
        _getFullCalendarOptions: function () {
             var result = this._super.apply(this, arguments);
             if (this.fieldColumn)
		        result.resources = [];
		     return result;
		},
		calendarEventToRecord: function (event) {
		    var result = this._super.apply(this, arguments);
		    if (event.resourceId)
		        result[this.fieldColumn] = event.resourceId;
		    return result;
		},
    });
});
