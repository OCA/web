//-*- coding: utf-8 -*-
//############################################################################
//
//   OpenERP, Open Source Management Solution
//   This module copyright (C) 2015 Therp BV <http://therp.nl>.
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

openerp.web_search_datetime_completion = function(instance)
{
    instance.web.search.DateTimeField.include({
        init: function(view_section, field, parent)
        {
            this.options = instance.web.py_eval(
                view_section.attrs.options || '{}');
            return this._super.apply(this, arguments);
        },
        complete: function(needle)
        {
            var self = this;
            return this._super.apply(this, arguments).then(function(options)
            {
                if(!options)
                {
                    return options;
                }
                var parsed_date = options[0].facet.values[0].value,
                    completion_options = self.options.completion_options || [{
                        hours: 23, minutes: 59, seconds: 59,
                    }];
                if(self.options.completion_options)
                {
                    options = []
                }
                _.each(completion_options, function(offset)
                {
                    var date = parsed_date.clone(),
                        date_string = '';
                    date.setHours(
                        offset.hours || date.getHours(),
                        offset.minutes || date.getMinutes(),
                        offset.seconds || date.getSeconds());
                    date_string = instance.web.format_value(
                        date, self.attrs);
                    options.push({
                        label: _.str.sprintf(_.str.escapeHTML(
                            instance.web._t("Search %(field)s at: %(value)s")),
                            {
                                field: _.str.sprintf(
                                    '<em>%s</em>',
                                    _.escape(self.attrs.string)),
                                value: _.str.sprintf(
                                    '<strong>%s</strong>',
                                    _.escape(date_string)),
                            }),
                        facet: {
                            category: self.attrs.string,
                            field: self,
                            values: [{
                                label: date_string,
                                value: date,
                            }],
                        },
                    });
                });
                return options;
            });
        },
    })
}
