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

openerp.web_relativedelta = function(openerp)
{
    var relativedelta = py.type('relativedelta', null,
    {
        __init__: function()
        {
            this.ops = py.PY_parseArgs(
                arguments,
                [
                    ['year', null],
                    ['years', null],
                    ['month', null],
                    ['months', null],
                    ['day', null],
                    ['days', null],
                    ['hour', null],
                    ['hours', null],
                    ['minute', null],
                    ['minutes', null],
                    ['second', null],
                    ['seconds', null],
                    ['weeks', null],
                    ['weekday', null],
                ]);
        },
        __add__: function(other)
        {
            if(other.__name__ != 'date' && other.__name__ != 'datetime')
            {
                return py.NotImplemented;
            }

            var result = moment({
                year: other.year,
                //january==0 in moment.js
                month: other.month - 1,
                day: other.day,
                hour: other.hour,
                minute: other.minute,
                second: other.second});

            if(this.ops.year)
            {
                result.year(Math.abs(this.ops.year._value));
            }
            if(this.ops.years)
            {
                result.add('years', this.ops.years._value);
            }
            if(this.ops.month)
            {
                //january==0 in moment.js
                result.month(Math.abs(this.ops.month._value % 13) - 1);
            }
            if(this.ops.months)
            {
                result.add('months', this.ops.months._value);
            }
            if(this.ops.day)
            {
                result = result.clone()
                    .endOf('month')
                    .hours(result.hours())
                    .minutes(result.minutes())
                    .seconds(result.seconds())
                    .max(result.clone()
                            .date(Math.abs(this.ops.day._value)));
            }
            if(this.ops.days)
            {
                result.add('days', this.ops.days._value)
            }
            if(this.ops.weeks)
            {
                result.add('days', this.ops.weeks._value * 7);
            }
            if(this.ops.hour)
            {
                result.hour(Math.abs(this.ops.hour._value % 24));
            }
            if(this.ops.hours)
            {
                result.add('hours', this.ops.hours._value);
            }
            if(this.ops.minute)
            {
                result.minute(Math.abs(this.ops.minute._value % 60));
            }
            if(this.ops.minutes)
            {
                result.add('minutes', this.ops.minutes._value);
            }
             if(this.ops.second)
            {
                result.second(Math.abs(this.ops.second._value % 60));
            }
            if(this.ops.seconds)
            {
                result.add('seconds', this.ops.seconds._value);
            }
            if(this.ops.weekday)
            {
                //in relativedelta, 0=MO, but in iso, 1=MO
                var isoWeekday = Math.abs(this.ops.weekday._value || 1) /
                    (this.ops.weekday._value || 1) *
                    (Math.abs(this.ops.weekday._value) + 1),
                    originalIsoWeekday = result.isoWeekday();
                result.isoWeekday(isoWeekday).add(
                        'weeks', isoWeekday < originalIsoWeekday ? 1 : 0);
            }

            var args = [
                result.year(),
                //january==0 in moment.js
                result.month() + 1,
                result.date(),
            ];
            if(other.__name__ == 'datetime')
            {
                args.push(result.hour());
                args.push(result.minute());
                args.push(result.second());
            }

            return py.PY_call(Object.getPrototypeOf(other), args);
        },
        __radd__: function(other)
        {
            return this.__add__(other);
        },
        __sub__: function(other)
        {
            _.each(this.ops, function(op, name)
            {
                if(!op || name == 'weekday')
                {
                    return;
                }
                op._value = -op._value;
            });
            return this.__add__(other);
        },
        __rsub__: function(other)
        {
            return this.__sub__(other);
        },
    });
    var original_pyeval_context = openerp.web.pyeval.context;
    openerp.web.pyeval.context = function ()
    {
        var ctx = original_pyeval_context();
        return _.extend(
                ctx,
                {
                    relativedelta: relativedelta,
                });
    }
}
