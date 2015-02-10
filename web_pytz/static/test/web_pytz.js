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
        'timezones',
        {dependencies: ['web.coresetup', 'web.pyeval']},
        function(test)
        {
            test('basic', function(instance)
            {
                openerp.web_pytz(instance);
                var eval = function(expression, context)
                {
                    var result_domain = instance.web.pyeval.eval(
                        'domain', "[['a', '=', " + expression + "]]",
                        context || {}, {});
                    return result_domain[0][2];
                }

                var result;
                
                result = eval(
                    "pytz.timezone('Europe/Amsterdam').localize(datetime.datetime(2014, 10, 6, 0, 0, 0)).astimezone(pytz.timezone('utc')).strftime('%Y-%m-%d %H:%M:%S')");
                ok(result == '2014-10-05 22:00:00', 'day start in Amsterdam, summer');

                result = eval(
                    "pytz.timezone('Europe/Amsterdam').localize(datetime.datetime(2014, 12, 6, 0, 0, 0)).astimezone(pytz.timezone('utc')).strftime('%Y-%m-%d %H:%M:%S')");
                ok(result == '2014-12-05 23:00:00', 'day start in Amsterdam, winter');

                result = eval(
                    "pytz.timezone('America/Toronto').localize(datetime.datetime(2014, 10, 6, 0, 0, 0)).astimezone(pytz.utc).strftime('%Y-%m-%d %H:%M:%S')");
                ok(result == '2014-10-06 04:00:00', 'day start in Torronto');

                result = eval(
                    "pytz.timezone('Asia/Shanghai').localize(datetime.datetime(2014, 10, 6, 0, 0, 0)).astimezone(pytz.utc).strftime('%Y-%m-%d %H:%M:%S')");
                ok(result == '2014-10-05 16:00:00', 'day start in Shanghai');

                _.each(['Europe/Amsterdam', 'America/Toronto', 'Asia/Shanghai'], function(tz)
                {
                    result = eval("utc_today().strftime('%Y-%m-%d %H:%M:%S')", {tz: tz});
                    var now = moment();
                    ok(result == moment.tz([now.year(), now.month(), now.date()], tz).hour(0).utc().format('YYYY-MM-DD HH:mm:ss'), _.str.sprintf('day start with shortcut in %s', tz));
                });
            });
        });
