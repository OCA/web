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

openerp.web_widget_x2many_2d_matrix = function(instance)
{
    instance.web.form.widgets.add(
        'x2many_2d_matrix',
        'instance.web_widget_x2many_2d_matrix.FieldX2Many2dMatrix');
    instance.web_widget_x2many_2d_matrix.FieldX2Many2dMatrix = instance.web.form.FieldOne2Many.extend({
        template: 'FieldX2Many2dMatrix',
        widget_class: 'oe_form_field_x2many_2d_matrix',

        // those will be filled with rows from the dataset
        by_x_axis: {},
        by_y_axis: {},
        field_x_axis: 'x',
        field_label_x_axis: 'x',
        field_y_axis: 'y',
        field_label_y_axis: 'y',
        field_value: 'value',
        // information about our datatype
        is_numeric: false,
        show_row_totals: true,
        show_column_totals: true,
        // this will be filled with the model's fields_get
        fields: {},

        // read parameters
        init: function(field_manager, node)
        {
            this.field_x_axis = node.attrs.field_x_axis || this.field_x_axis;
            this.field_y_axis = node.attrs.field_y_axis || this.field_y_axis;
            this.field_label_x_axis = node.attrs.field_label_x_axis || this.field_x_axis;
            this.field_label_y_axis = node.attrs.field_label_y_axis || this.field_y_axis;
            this.field_value = node.attrs.field_value || this.field_value;
            this.show_row_totals = node.attrs.show_row_totals || this.show_row_totals;
            this.show_column_totals = node.attrs.show_column_totals || this.show_column_totals;
            return this._super.apply(this, arguments);
        },

        // return a field's value, id in case it's a one2many field
        get_field_value: function(row, field, many2one_as_name)
        {
            if(this.fields[field].type == 'many2one' && _.isArray(row[field]))
            {
                if(many2one_as_name)
                {
                    return row[field][1];
                }
                else
                {
                    return row[field][0];
                }
            }
            return row[field];
        },

        // setup our datastructure for simple access in the template
        set_value: function()
        {
            var self = this,
                result = this._super.apply(this, arguments);

            self.by_x_axis = {};
            self.by_y_axis = {};
                
            return jQuery.when(result).then(function()
            {
                return self.dataset._model.call('fields_get').then(function(fields)
                {
                    self.fields = fields;
                    self.is_numeric = fields[self.field_value].type == 'float';
                    self.show_row_totals &= self.is_numeric;
                    self.show_column_totals &= self.is_numeric;
                }).then(function()
                {
                    return self.dataset.read_ids(self.dataset.ids).then(function(rows)
                    {
                        var read_many2one = {},
                            many2one_fields = [
                                self.field_x_axis, self.field_y_axis,
                                self.field_label_x_axis, self.field_label_y_axis
                            ];
                        // prepare to read many2one names if necessary (we can get (id, name) or just id as value)
                        _.each(many2one_fields, function(field)
                        {
                            if(self.fields[field].type == 'many2one')
                            {
                                read_many2one[field] = {};
                            }
                        });
                        // setup data structure
                        _.each(rows, function(row)
                        {
                            var x = self.get_field_value(row, self.field_x_axis),
                                y = self.get_field_value(row, self.field_y_axis);
                            self.by_x_axis[x] = self.by_x_axis[x] || {};
                            self.by_y_axis[y] = self.by_y_axis[y] || {};
                            self.by_x_axis[x][y] = row;
                            self.by_y_axis[y][x] = row;
                            _.each(read_many2one, function(rows, field)
                            {
                                if(!_.isArray(row[field]))
                                {
                                    rows[row[field]] = rows[row[field]] || []
                                    rows[row[field]].push(row);
                                }
                            });
                        });
                        // read many2one fields if necessary
                        var deferrends = [];
                        _.each(read_many2one, function(rows, field)
                        {
                            if(_.isEmpty(rows))
                            {
                                return;
                            }
                            var model = new instance.web.Model(self.fields[field].relation);
                            deferrends.push(model.call(
                                'name_get',
                                [_.map(_.keys(rows), function(key) {return parseInt(key)})])
                                .then(function(names)
                                {
                                    _.each(names, function(name)
                                    {
                                        _.each(rows[name[0]], function(row)
                                        {
                                            row[field] = name;
                                        });
                                    });
                                }));
                        })
                        return jQuery.when.apply(jQuery, deferrends);
                    });
                });
            });
        },

        // get x axis values in the correct order
        get_x_axis_values: function()
        {
            return _.keys(this.by_x_axis);
        },

        // get y axis values in the correct order
        get_y_axis_values: function()
        {
            return _.keys(this.by_y_axis);
        },

        // get the label for a value on the x axis
        get_x_axis_label: function(x)
        {
            return this.get_field_value(
                _.first(_.values(this.by_x_axis[x])),
                this.field_label_x_axis, true);
        },

        // get the label for a value on the y axis
        get_y_axis_label: function(y)
        {
            return this.get_field_value(
                _.first(_.values(this.by_y_axis[y])),
                this.field_label_y_axis, true);
        },

        // return the class(es) the inputs should have
        get_xy_value_class: function()
        {
            var classes = 'oe_form_field oe_form_required';
            if(this.is_numeric)
            {
                classes += ' oe_form_field_float';
            }
            return classes;
        },

        // return row id of a coordinate
        get_xy_id: function(x, y)
        {
            return this.by_x_axis[x][y]['id'];
        },

        // return the value of a coordinate
        get_xy_value: function(x, y)
        {
            return this.get_field_value(
                this.by_x_axis[x][y], this.field_value);
        },

        // validate a value
        validate_xy_value: function(val)
        {
            try
            {
                this.parse_xy_value(val);
            }
            catch(e)
            {
                return false;
            }
            return true;
        },

        // parse a value from user input
        parse_xy_value: function(val)
        {
            return instance.web.parse_value(
                val, {'type': this.fields[this.field_value].type});
        },

        // format a value from the database for display
        format_xy_value: function(val)
        {
            return instance.web.format_value(
                val, {'type': this.fields[this.field_value].type});
        },

        // compute totals
        compute_totals: function()
        {
            var self = this,
                grand_total = 0,
                totals_x = {},
                totals_y = {};
            return self.dataset.read_ids(self.dataset.ids).then(function(rows)
            {
                _.each(rows, function(row)
                {
                    var key_x = self.get_field_value(row, self.field_x_axis),
                        key_y = self.get_field_value(row, self.field_y_axis);
                    totals_x[key_x] = (totals_x[key_x] || 0) + self.get_field_value(row, self.field_value);
                    totals_y[key_y] = (totals_y[key_y] || 0) + self.get_field_value(row, self.field_value);
                    grand_total += self.get_field_value(row, self.field_value);
                });
            }).then(function()
            {
                _.each(totals_y, function(total, y)
                {
                    self.$el.find(
                        _.str.sprintf('td.row_total[data-y="%s"]', y)).text(
                            self.format_xy_value(total));
                });
                _.each(totals_x, function(total, x)
                {
                    self.$el.find(
                        _.str.sprintf('td.column_total[data-x="%s"]', x)).text(
                            self.format_xy_value(total));
                });
                self.$el.find('.grand_total').text(
                    self.format_xy_value(grand_total))
                return {
                    totals_x: totals_x,
                    totals_y: totals_y,
                    grand_total: grand_total,
                };
            });
        },

        setup_many2one_axes: function()
        {
            if(this.fields[this.field_x_axis].type == 'many2one')
            {
                this.$el.find('th[data-x]').addClass('oe_link')
                .click(_.partial(
                    this.proxy(this.many2one_axis_click),
                    this.field_x_axis, 'x'));
            }
            if(this.fields[this.field_y_axis].type == 'many2one')
            {
                this.$el.find('tr[data-y] th').addClass('oe_link')
                .click(_.partial(
                    this.proxy(this.many2one_axis_click),
                    this.field_y_axis, 'y'));
            }
        },

        many2one_axis_click: function(field, id_attribute, e)
        {
            this.do_action({
                type: 'ir.actions.act_window',
                name: this.fields[field].string,
                res_model: this.fields[field].relation,
                res_id: jQuery(e.currentTarget).data(id_attribute),
                views: [[false, 'form']],
                target: 'current',
            })
        },

        start: function()
        {
            var self = this;
            this.$el.find('input').on(
                'change',
                function()
                {
                    var $this = jQuery(this),
                        val = $this.val()
                    if(self.validate_xy_value(val))
                    {
                        var data = {}, value = self.parse_xy_value(val);
                        data[self.field_value] = value;

                        $this.siblings('span').text(self.format_xy_value(value));
                        $this.val(self.format_xy_value(value));

                        self.dataset.write($this.data('id'), data);
                        $this.parent().removeClass('oe_form_invalid');
                        self.compute_totals();
                    }
                    else
                    {
                        $this.parent().addClass('oe_form_invalid');
                    }

                });
            this.compute_totals();
            this.setup_many2one_axes();
            this.on("change:effective_readonly",
                    this, this.proxy(this.effective_readonly_change));
            this.effective_readonly_change();
            return this._super.apply(this, arguments);
        },

        effective_readonly_change: function()
        {
            this.$el
            .find('tbody td.oe_list_field_cell span.oe_form_field>input')
            .toggle(!this.get('effective_readonly'));
            this.$el
            .find('tbody td.oe_list_field_cell span.oe_form_field>span')
            .toggle(this.get('effective_readonly'));
            this.$el.find('input').first().focus();
        },

        is_syntax_valid: function()
        {
            return this.$el.find('.oe_form_invalid').length == 0;
        },

        // deactivate view related functions
        load_views: function() {},
        reload_current_view: function() {},
        get_active_view: function() {},
    });
}
