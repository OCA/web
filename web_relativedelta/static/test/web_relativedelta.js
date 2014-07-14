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

openerp.testing.section(
        'python_compatibility',
        {dependencies: ['web.coresetup', 'web.pyeval']},
        function(test)
        {
            test('basic deltas', function(instance)
            {
                openerp.web_relativedelta(instance);
                var eval = function(expression)
                {
                    var result_domain = instance.web.pyeval.eval(
                        'domain', "[['a', '=', " + expression + "]]", {}, {});
                    return result_domain[0][2];
                }

                var result;
                
                result = eval(
                    "(datetime.date(2012, 12, 25) + relativedelta(days=7)).strftime('%Y-%m-%d')");
                ok(result == '2013-01-01', "cross year");

                result = eval(
                    //2012 is a leap year
                    "(datetime.date(2012, 01, 01) + relativedelta(days=366)).strftime('%Y-%m-%d')");
                ok(result == '2013-01-01', "cross leap year");

                result = eval(
                    "(datetime.date(2012, 02, 01) + relativedelta(day=366)).strftime('%Y-%m-%d')");
                ok(result == '2012-02-29', "absolute day");
                
                result = eval(
                    "(datetime.date(2012, 02, 01) + relativedelta(hours=-1)).strftime('%Y-%m-%d')");
                ok(result == '2012-01-31', "negative hour");

                result = eval(
                    "(datetime.date(2012, 01, 30) + relativedelta(weekday=0)).strftime('%Y-%m-%d')");
                ok(result == '2012-01-30', "weekday=MO (on monday)");

                result = eval(
                    "(datetime.date(2012, 01, 31) + relativedelta(weekday=0)).strftime('%Y-%m-%d')");
                ok(result == '2012-02-06', "weekday=MO (on tuesday)");

                result = eval(
                    "(datetime.date(2012, 01, 30) + relativedelta(weeks=-1, days=1, weekday=0)).strftime('%Y-%m-%d')");
                ok(result == '2012-01-30', "last monday (on monday)");

                result = eval(
                    "(datetime.date(2012, 01, 31) + relativedelta(weeks=-1, days=1, weekday=0)).strftime('%Y-%m-%d')");
                ok(result == '2012-01-30', "last monday (on tuesday)");

                result = eval(
                    "(datetime.date(2012, 02, 01) + relativedelta(weeks=-1, days=1, weekday=0)).strftime('%Y-%m-%d')");
                ok(result == '2012-01-30', "last monday (on wednesday)");
               });
        });
