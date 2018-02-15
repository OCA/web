/* Copyright 2015 Holger Brunn <hbrunn@therp.nl>
 * Copyright 2016 Pedro M. Baeza <pedro.baeza@tecnativa.com>
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define('web_widget_x2many_2d_matrix.widget', function (require) {
    "use strict";

    var core = require('web.core');
    var FieldManagerMixin = require('web.FieldManagerMixin');
    var Widget = require('web.Widget');
    var fieldRegistry = require('web.field_registry');
    var widgetRegistry = require('web.widget_registry');
    var widgetOne2many = widgetRegistry.get('one2many');
    var data = require('web.data');
    var $ = require('jquery');

    var WidgetX2Many2dMatrix = widgetOne2Many.extend(FieldManagerMixin, {
        template: 'FieldX2Many2dMatrix',
        widget_class: 'oe_form_field_x2many_2d_matrix',

        // those will be filled with rows from the dataset
        by_x_axis: {},
        by_y_axis: {},
        by_id: {},
        // configuration values
        field_x_axis: 'x',
        field_label_x_axis: 'x',
        field_y_axis: 'y',
        field_label_y_axis: 'y',
        field_value: 'value',
        x_axis_clickable: true,
        y_axis_clickable: true,
        // information about our datatype
        is_numeric: false,
        show_row_totals: true,
        show_column_totals: true,
        // this will be filled with the model's fields_get
        fields: {},
        // Store fields used to fill HTML attributes
        fields_att: {},

        parse_boolean: function(val)
        {
            if (val.toLowerCase() === 'true' || val === '1') {
                return true;
            }
            return false;
        },

        // read parameters
        init: function (parent, fieldname, record, therest) {
            var res = this._super(parent, fieldname, record, therest);
            FieldManagerMixin.init.call(this);
            var node = record.fieldsInfo[therest.viewType][fieldname];

            this.field_x_axis = node.field_x_axis || this.field_x_axis;
            this.field_y_axis = node.field_y_axis || this.field_y_axis;
            this.field_label_x_axis = node.field_label_x_axis || this.field_x_axis;
            this.field_label_y_axis = node.field_label_y_axis || this.field_y_axis;
            this.x_axis_clickable = this.parse_boolean(node.x_axis_clickable || '1');
            this.y_axis_clickable = this.parse_boolean(node.y_axis_clickable || '1');
            this.field_value = node.field_value || this.field_value;
            for (var property in node) {
                if (property.startsWith("field_att_")) {
                    this.fields_att[property.substring(10)] = node[property];
                }
            }
            this.field_editability = node.field_editability || this.field_editability;
            this.show_row_totals = this.parse_boolean(node.show_row_totals || '1');
            this.show_column_totals = this.parse_boolean(node.show_column_totals || '1');
            this.init_fields();
            // this.set_value(undefined);

            return res;
        },

        init_fields: function() {
            return;
        },

        // return a field's value, id in case it's a one2many field
        get_field_value: function(row, field, many2one_as_name)
        // FIXME looks silly
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
        set_value: function(value_)
        {
            var self = this,
                result = this._super(value_);

            self.by_x_axis = {};
            self.by_y_axis = {};
            self.by_id = {};

            return $.when(result).then(function()
            {
                return self.dataset._model.call('fields_get').then(function(fields)
                {
                    self.fields = fields;
                    self.is_numeric = fields[self.field_value].type == 'float';
                    self.show_row_totals &= self.is_numeric;
                    self.show_column_totals &= self.is_numeric;
                })
                // if there are cached writes on the parent dataset, read below
                // only returns the written data, which is not enough to properly
                // set up our data structure. Read those ids here and patch the
                // cache
                .then(function()
                {
                    var ids_written = _.map(
                        self.dataset.to_write, function(x) { return x.id });
                    if(!ids_written.length)
                    {
                        return;
                    }
                    return (new data.Query(self.dataset._model))
                    .filter([['id', 'in', ids_written]])
                    .all()
                    .then(function(rows)
                    {
                        _.each(rows, function(row)
                        {
                            var cache = _.find(
                                self.dataset.cache,
                                function(x) { return x.id == row.id }
                            );
                            _.extend(cache.values, row, _.clone(cache.values));
                        })
                    })
                })
                .then(function()
                {
                    return self.dataset.read_ids(self.dataset.ids, self.fields).then(function(rows)
                    {
                        // setup data structure
                        _.each(rows, function(row)
                        {
                            self.add_xy_row(row);
                        });
                        if(self.is_started && !self.no_rerender)
                        {
                            self.renderElement();
                            self.compute_totals();
                            self.setup_many2one_axes();
                            self.$el.find('.edit').on(
                                'change', self.proxy(self.xy_value_change));
                            self.effective_readonly_change();
                        }
                    });
                });
            });
        },

        // do whatever needed to setup internal data structure
        add_xy_row: function(row)
        {
            var x = this.get_field_value(row, this.field_x_axis),
                y = this.get_field_value(row, this.field_y_axis);
            // row is a *copy* of a row in dataset.cache, fetch
            // a reference to this row in order to have the
            // internal data structure point to the same data
            // the dataset manipulates
            _.every(this.dataset.cache, function(cached_row)
            {
                if(cached_row.id == row.id)
                {
                    row = cached_row.values;
                    // new rows don't have that
                    row.id = cached_row.id;
                    return false;
                }
                return true;
            });
            this.by_x_axis[x] = this.by_x_axis[x] || {};
            this.by_y_axis[y] = this.by_y_axis[y] || {};
            this.by_x_axis[x][y] = row;
            this.by_y_axis[y][x] = row;
            this.by_id[row.id] = row;
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

        get_xy_att: function(x, y)
        {
            var vals = {};
            for (var att in this.fields_att) {
                var val = this.get_field_value(
                    this.by_x_axis[x][y], this.fields_att[att]);
                // Discard empty values
                if (val) {
                    vals[att] = val;
                }
            }
            return vals;
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
                return val;
        },

        // format a value from the database for display
        format_xy_value: function(val)
        {
                return val;
        },

        // compute totals
        compute_totals: function()
        {
            var self = this,
                grand_total = 0,
                totals_x = {},
                totals_y = {},
                rows = this.by_id,
                deferred = $.Deferred();
            _.each(rows, function(row)
            {
                var key_x = self.get_field_value(row, self.field_x_axis),
                    key_y = self.get_field_value(row, self.field_y_axis);
                totals_x[key_x] = (totals_x[key_x] || 0) + self.get_field_value(row, self.field_value);
                totals_y[key_y] = (totals_y[key_y] || 0) + self.get_field_value(row, self.field_value);
                grand_total += self.get_field_value(row, self.field_value);
            });
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
            deferred.resolve({
                totals_x: totals_x,
                totals_y: totals_y,
                grand_total: grand_total,
                rows: rows,
            });
            return deferred;
        },

        setup_many2one_axes: function()
        {
            if(this.fields[this.field_x_axis].type == 'many2one' && this.x_axis_clickable)
            {
                this.$el.find('th[data-x]').addClass('oe_link')
                .click(_.partial(
                    this.proxy(this.many2one_axis_click),
                    this.field_x_axis, 'x'));
            }
            if(this.fields[this.field_y_axis].type == 'many2one' && this.y_axis_clickable)
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
                res_id: $(e.currentTarget).data(id_attribute),
                views: [[false, 'form']],
                target: 'current',
            })
        },

        start: function()
        {
            var self = this;
            this.$el.find('.edit').on(
                'change', self.proxy(this.xy_value_change));
            this.compute_totals();
            this.setup_many2one_axes();
            this.on("change:effective_readonly",
                    this, this.proxy(this.effective_readonly_change));
            this.effective_readonly_change();
            return this._super();
        },

        xy_value_change: function(e)
        {
            var $this = $(e.currentTarget),
                val = $this.val();
            if(this.validate_xy_value(val))
            {
                var data = {}, value = this.parse_xy_value(val);
                data[this.field_value] = value;

                $this.siblings('.read').text(this.format_xy_value(value));
                $this.val(this.format_xy_value(value));

                this.dataset.write($this.data('id'), data);
                this.by_id[$this.data('id')][this.field_value] = value;
                $this.parent().removeClass('oe_form_invalid');
                this.compute_totals();
            }
            else
            {
                $this.parent().addClass('oe_form_invalid');
            }

        },

        effective_readonly_change: function()
        {
            this.$el
            .find('tbody .edit')
            .toggle(!this.get('effective_readonly'));
            this.$el
            .find('tbody .read')
            .toggle(this.get('effective_readonly'));
            this.$el.find('.edit').first().focus();
        },

        is_syntax_valid: function()
        {
            return this.$el.find('.oe_form_invalid').length == 0;
        },

        load_views: function() {
            // Needed for removing the initial empty tree view when the widget
            // is loaded
            var self = this,
                result = this._super();

            return $.when(result).then(function()
            {
                self.renderElement();
                self.compute_totals();
                self.$el.find('.edit').on(
                        'change', self.proxy(self.xy_value_change));
            });
        },
    });

    fieldRegistry.add(
        'x2many_2d_matrix', WidgetX2Many2dMatrix
    );

    return {
        WidgetX2Many2dMatrix: WidgetX2Many2dMatrix
    };
});
