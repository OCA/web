//-*- coding: utf-8 -*-
//############################################################################
//
//   odoo, Open Source Management Solution
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

    odoo.define_section('web_compute_domain_x2many', ['web.data', 'web.pyeval'], function (test)
    {
        //start odoo core tests from web/static/test/form.js
        test("basic", function (assert, data) {
            var fields = {
                'a': {value: 3},
                'group_method': {value: 'line'},
                'select1': {value: 'day'},
                'rrule_type': {value: 'monthly'}
            };
            assert.ok(data.compute_domain(
                [['a', '=', 3]], fields));
            assert.ok(data.compute_domain(
                [['group_method','!=','count']], fields));
            assert.ok(data.compute_domain(
                [['select1','=','day'], ['rrule_type','=','monthly']], fields));
        });
        test("or", function (assert, data) {
            var web = {
                'section_id': {value: null},
                'user_id': {value: null},
                'member_ids': {value: null}
            };

            var domain = ['|', ['section_id', '=', 42],
                          '|', ['user_id','=',3],
                               ['member_ids', 'in', [3]]];

            assert.ok(data.compute_domain(domain, _.extend(
                {}, web, {'section_id': {value: 42}})));
            assert.ok(data.compute_domain(domain, _.extend(
                {}, web, {'user_id': {value: 3}})));

            assert.ok(data.compute_domain(domain, _.extend(
                {}, web, {'member_ids': {value: 3}})));
        });
        test("not", function (assert, data) {
            var fields = {
                'a': {value: 5},
                'group_method': {value: 'line'}
            };
            assert.ok(data.compute_domain(
                ['!', ['a', '=', 3]], fields));
            assert.ok(data.compute_domain(
                ['!', ['group_method','=','count']], fields));
        });
        //end odoo core tests
        var fields = {
            one2many_empty: {value: [], field: {type: 'one2many'}},
            one2many_one_entry: {value: [[4, 42, false]], field: {type: 'one2many'}},
            one2many_multiple_entries: {value: [[4, 42, false], [4, 43, false]], field: {type: 'one2many'}},
            many2many_empty: {value: [[6, false, []]], field: {type: 'many2many'}},
            many2many_one_entry: {value: [[6, false, [42]]], field: {type: 'many2many'}},
            many2many_multiple_entries: {value: [[6, false, [42, 43]]], field: {type: 'many2many'}},
        };
        test('legacy behavior', function(assert, data, pyeval)
        {
            var eval = function(expression, fields)
            {
                expression = pyeval.eval('domain', expression, {}, {});
                return data.compute_domain(expression, fields)
            }
            assert.ok(eval("[('one2many_empty', '=', [])]", fields), 'empty one2many');
            assert.ok(eval("[('many2many_empty', '=', [[6, False, []]])]", fields), 'empty many2many');
        });
        test('x2many tests', function(assert, data, pyeval)
        {
            var eval = function(expression, fields)
            {
                expression = pyeval.eval('domain', expression, {}, {});
                return data.compute_domain(expression, fields)
            }
            assert.ok(!eval("[('one2many_empty', '=', 42)]", fields), 'empty one2many == value');
            assert.ok(eval("[('one2many_one_entry', '=', 42)]", fields), 'one2many with one entry == value');
            assert.ok(eval("[('one2many_multiple_entries', '=', 42)]", fields), 'one2many with multiple entries == value');
            assert.ok(eval("[('one2many_multiple_entries', 'in', [42])]", fields), 'one2many with multiple entries in [value]');
            assert.ok(!eval("[('many2many_empty', '=', 42)]", fields), 'empty many2many == value');
            assert.ok(eval("[('many2many_one_entry', '=', 42)]", fields), 'many2many with one entry == value');
            assert.ok(eval("[('many2many_multiple_entries', '=', 42)]", fields), 'many2many with multiple entries == value');
            assert.ok(eval("[('many2many_multiple_entries', 'in', [42])]", fields), 'many2many with multiple entries in [value]');
            assert.ok(eval("[('many2many_multiple_entries', 'not in', [44])]", fields), 'many2many with multiple entries not in [value]');
        });
    });
