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

odoo.define('web_widget_datepicker_options.datepicker', function(require) {
    "use strict";
    var Widget = require('web.datepicker');

    Widget.DateWidget.include({
        init: function() {
            this._super.apply(this, arguments);
            if(typeof this.__parentedParent !== 'undefined' && this.__parentedParent.field.type === 'date' && this.__parentedParent.nodeOptions){
                var datepicker = this.__parentedParent.nodeOptions.datepicker;
                Object.assign(this.options, datepicker);
            }
        },
    });

    Widget.DateTimeWidget.include({
        init: function() {
            this._super.apply(this, arguments);
            if(typeof this.__parentedParent !== 'undefined' && this.__parentedParent.field.type === 'date' && this.__parentedParent.nodeOptions){
                var datepicker = this.__parentedParent.nodeOptions.datepicker;
                Object.assign(this.options, datepicker);
            }
        },
    });
});
