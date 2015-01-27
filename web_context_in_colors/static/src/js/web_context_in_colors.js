//-*- coding: utf-8 -*-
//############################################################################
//
//   OpenERP, Open Source Management Solution
//   This module copyright (C) 2014 Therp BV (<http://therp.nl>).
//
//   This program is free software: you can redistribute it and/or modify
//   it under the terms of the GNU Affero General Public License as
//   published by the Free Software Foundation, either version 3 of the
//   License, or (at your option) any later version.
//
//   This program is distributed in the hope that it will be useful,
//   but WITHOUT ANY WARRANTY; without even the implied warranty of
//   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//   GNU Affero General Public License for more details.
//
//   You should have received a copy of the GNU Affero General Public License
//   along with this program.  If not, see <http://www.gnu.org/licenses/>.
//
//############################################################################

openerp.web_context_in_colors = function(instance)
{
    instance.web.ListView.include(
    {
        style_for: function (record)
        {
            var record_with_context = {
                attributes: _.extend({}, record.attributes || {}),
            };
            if(!record_with_context.attributes.context)
            {
                record_with_context.attributes.context = py.dict.fromJSON(
                    instance.web.pyeval.eval(
                        'context', this.dataset.get_context()));
            }
            return this._super.apply(this, [record_with_context]);
        },
    });
}
