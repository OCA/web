/*
    OpenERP, Open Source Management Solution
    This module copyright (C) 2015 Savoir-faire Linux
    (<http://www.savoirfairelinux.com>).

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
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

