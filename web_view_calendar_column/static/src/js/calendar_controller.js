odoo.define('web_view_calendar_column.CalendarController', function (require) {
    "use strict";

    var CalendarController = require('web.CalendarController');

    CalendarController.include({
        _onOpenCreate: function (event) {
            if (event.data.resource && event.data.resource.id) {
                var value = event.data.resource.id;
                if (this.model.fields[this.model.fieldColumn].type === 'many2one')
                    value = parseInt(value);
                this.context['default_'+ this.model.fieldColumn] = value;
            }
            else
                this.context['default_'+ this.model.fieldColumn] = false;
            return this._super.apply(this, arguments);
        },
    });
});
