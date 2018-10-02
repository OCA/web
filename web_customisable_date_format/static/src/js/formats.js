// © 2016- Leonardo Donelli (donelli at monksoftware it)
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

odoo.define('web_customisable_date_format.formats', function(require) {
    'use strict';

    var time = require('web.time');
    var formats = require('web.formats');

    var original_format_value = formats.format_value;
    var new_format_value = function(value, descriptor, value_if_empty) {
        // in list view columns, format is passed in the date_format attribute
        if (descriptor.date_format) {
            var v = moment(time.auto_str_to_date(value));
            return v.format(descriptor.date_format);
        }
        // in form view fields, format is passed in the 'date_format' key of the options attribute
        if (descriptor.options && descriptor.options.date_format) {
            var v = moment(time.auto_str_to_date(value));
            return v.format(descriptor.options.date_format);
        }
        return original_format_value.apply(this, arguments);
    };
    formats.format_value = new_format_value;

});
