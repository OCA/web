/*############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2014 TeMPO Consulting (<http://www.tempo-consulting.fr>),
#                  2014 Therp BV (<http://therp.nl>).
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
############################################################################*/

openerp.web_percent = function(instance)
{
    /* Form view widget */
    instance.web.form.FieldPercent = instance.web.form.FieldFloat.extend(
    {
        template: "FieldPercent",
        widget_class: 'oe_form_field_float',
    });
    instance.web.form.widgets.add('percent', 'instance.web.form.FieldPercent');

    /* Tree view widget */
    instance.web.list.Column.include({
        _format: function (row_data, options) {
            if (this.widget == 'percent') {
                // _super behaves differently if widget is set
                this.widget = undefined;
                res = this._super(row_data, options) + '%';
                this.widget = 'percent';
                return res;
            }
            return this._super(row_data, options);
        }
    });
}
