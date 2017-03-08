/*
    Copyright 2015 Savoir-faire Linux
    GNU Affero General Public License version 3 or later
    http://www.gnu.org/licenses/
*/

odoo.define('web_widget_datepicker_options', function (require) {

    "use strict";

    var core = require('web.core');

    var DateTimeWidget = require('web.datepicker').DateTimeWidget;
    var DateWidget = require('web.datepicker').DateWidget;

    DateTimeWidget.include({
        start: function(parent, options) {
            this._super.apply(this, arguments);
            var self = this;
            if (this.__parentedParent.options.datepicker) {
                var options = this.__parentedParent.options.datepicker;
                $.each(options, function(value, key) {
                    self.options[value] = key;
                    self.picker[value] = key;
                    self.picker.options[value] = key;
                });
            }
        },
    });

    DateWidget.include({
        start: function(parent, options) {
            this._super.apply(this, arguments);
            var self = this;
            if (this.__parentedParent.options.datepicker) {
                var options = this.__parentedParent.options.datepicker;
                $.each(options, function(value, key) {
                    self.options[value] = key;
                    self.picker[value] = key;
                    self.picker.options[value] = key;
                });
            }
        },
    });

});
