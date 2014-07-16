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

openerp.web_compute_domain_x2many = function(instance)
{
    var _t = instance.web._t;

    function find_in_commands(commands, id)
    //check if a list of commands contains an id in a way that it will be
    //contained after the command list is evaluated
    {
        return _.reduce(
            _.map(
                commands,
                function(command)
                {
                    switch(command[0])
                    {
                        case 1:
                        case 4:
                            return 1;
                        case 2:
                        case 3:
                        case 5:
                            return -1
                        case 6:
                            return _(command[2]).contains(id);
                        default:
                            return 0;
                    }
                }
            ),
            function(a, b) {return a + b},
            0
        ) > 0;
    }
    var comparators = {
        scalar: function(field_value, op, val, field)
        {
            switch (op.toLowerCase()) {
                case '=':
                case '==':
                    return _.isEqual(field_value, val);
                case '!=':
                case '<>':
                    return !_.isEqual(field_value, val);
                case '<':
                    return field_value < val;
                case '>':
                    return field_value > val;
                case '<=':
                    return field_value <= val;
                case '>=':
                    return field_value >= val;
                case 'in':
                    if (!_.isArray(val)) val = [val];
                    return _(val).contains(field_value);
                case 'not in':
                    if (!_.isArray(val)) val = [val];
                    return !_(val).contains(field_value);
                default:
                    console.warn(
                        _t("Unsupported operator %s in domain %s"),
                        op, JSON.stringify(expr));
                    return true;
            }
        },
        one2many: function(field_value, op, val, field)
        {
            switch(op.toLowerCase())
            {
                case '=':
                case '==':
                    if(!_.isArray(val))
                    {
                        return find_in_commands(field_value, val);
                    }
                    else
                    {
                        return comparators.scalar(field_value, op, val, field);
                    }
                case '!=':
                case '<>':
                    return !comparators.one2many(field_value, '=', val, field);
                case 'in':
                    var found = false;
                    _.each(val, function(v)
                    {
                        found |= find_in_commands(field_value, v);
                    });
                    return found;
                case 'not in':
                    return !comparators.one2many(field_value, 'in', val, field);
                default:
                    return comparators.scalar(field_value, op, val, field);
            }
        },
        many2many: function()
        {
            return comparators.one2many.apply(this, arguments);;
        },
    };
    //start OpenERP compute_domain from web/static/src/view_form.js
    instance.web.form.compute_domain = function(expr, fields) {
        if (! (expr instanceof Array))
            return !! expr;
        var stack = [];
        for (var i = expr.length - 1; i >= 0; i--) {
            var ex = expr[i];
            if (ex.length == 1) {
                var top = stack.pop();
                switch (ex) {
                    case '|':
                        stack.push(stack.pop() || top);
                        continue;
                    case '&':
                        stack.push(stack.pop() && top);
                        continue;
                    case '!':
                        stack.push(!top);
                        continue;
                    default:
                        throw new Error(_.str.sprintf(
                            _t("Unknown operator %s in domain %s"),
                            ex, JSON.stringify(expr)));
                }
            }

            var field = fields[ex[0]];
            if (!field) {
                throw new Error(_.str.sprintf(
                    _t("Unknown field %s in domain %s"),
                    ex[0], JSON.stringify(expr)));
            }
            var field_value = field.get_value ? field.get_value() : field.value;
            var op = ex[1];
            var val = ex[2];
            //begin local changes
            var field_type = field.field ? field.field.type : 'scalar';
            var comparator = comparators[field_type] ? comparators[field_type] : comparators.scalar;
            stack.push(comparator(field_value, op, val, field));
            //end local changes
        }
        return _.all(stack, _.identity);
    };
    //end OpenERP compute_domain

    instance.web_compute_domain_x2many.comparators = comparators;
}
