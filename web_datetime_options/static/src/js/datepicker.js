/*global openerp, _, $ */

openerp.web_datetime_options = function (instance) {

    "use strict";

    instance.web.form.FieldDatetime = instance.web.form.FieldDatetime.extend({
        initialize_content: function() {
            this._super();
            var self = this;
            if (this.datewidget) {
                if (typeof this.options.datepicker === 'object') {
                    $.map(this.options.datepicker, function(value, key) {
                        self.datewidget.picker('option', key, value);
                    });
                }
            }
        }
    });

    instance.web.form.FieldDate = instance.web.form.FieldDate.extend({
        initialize_content: function() {
            this._super();
            var self = this;
            if (this.datewidget) {
                if (typeof this.options.datepicker === 'object') {
                    $.map(this.options.datepicker, function(value, key) {
                        self.datewidget.picker('option', key, value);
                    });
                }
            }
        }
    });
};

