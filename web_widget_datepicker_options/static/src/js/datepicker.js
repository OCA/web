/*
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
*/

odoo.define('web_widget_datepicker_options.datepicker', function(require) {
    "use strict";
    var Widget = require('web.datepicker');

    Widget.DateWidget.include({
        init: function() {
            this._super.apply(this, arguments);
            var parent = this.getParent();
            if(typeof parent !== 'undefined'
                    && typeof parent.field !== 'undefined'
                    && parent.field.type === 'date'
                    && parent.nodeOptions){
                var datepicker = parent.nodeOptions.datepicker;
                _.assign(this.options, datepicker);
            }
        },
    });

    Widget.DateTimeWidget.include({
        init: function() {
            this._super.apply(this, arguments);
            var parent = this.getParent();
            if(typeof parent !== 'undefined'
                    && typeof parent.field !== 'undefined'
                    && parent.field.type === 'datetime'
                    && parent.nodeOptions){
                var datepicker = parent.nodeOptions.datepicker;
                _.assign(this.options, datepicker);
            }
        },
    });
});
