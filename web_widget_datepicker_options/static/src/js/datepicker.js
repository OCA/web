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

odoo.define('web_widget_datepicker_options', function (require) {

    "use strict";

    var core = require('web.core');

    var DateWidget = require('web.datepicker').DateWidget;

    DateWidget.include({
        init: function(parent, options) {
            this._super.apply(this, arguments);
            var self = this;
            if (self.__parentedParent.options instanceof Object) {
                if (self.__parentedParent.options.datepicker instanceof Object) {
                    var options = this.__parentedParent.options.datepicker;
                    $.each(options, function(value, key) {
                        self.options[value] = key;
                    });
                }
            }
        },
    });

});
