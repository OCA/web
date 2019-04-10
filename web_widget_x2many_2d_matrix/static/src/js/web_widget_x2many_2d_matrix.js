/* Copyright 2015 Holger Brunn <hbrunn@therp.nl>
 * Copyright 2016 Pedro M. Baeza <pedro.baeza@tecnativa.com>
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

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
        by_x_axis_sorted: [],
        by_y_axis_sorted: [],
        by_id: {},
        // configuration values
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
        // Store fields used to fill HTML attributes
        fields_att: {},
        x_axis_clickable: true,
        y_axis_clickable: true,
        xy_many2one: false,

        // read parameters
        init: function(field_manager, node)
        {
            this.field_x_axis = node.attrs.field_x_axis || this.field_x_axis;
            this.field_y_axis = node.attrs.field_y_axis || this.field_y_axis;
            this.x_axis_clickable = node.attrs.x_axis_clickable || this.x_axis_clickable;
            this.y_axis_clickable = node.attrs.y_axis_clickable || this.y_axis_clickable;
            this.xy_many2one = node.attrs.xy_many2one || this.xy_many2one;
            this.field_label_x_axis = node.attrs.field_label_x_axis || this.field_x_axis;
            this.field_label_y_axis = node.attrs.field_label_y_axis || this.field_y_axis;
            this.field_value = node.attrs.field_value || this.field_value;
            for (var property in node.attrs) {
                if (property.indexOf("field_att_") === 0) {
                    this.fields_att[property.substring(10)] = node.attrs[property];
                }
            }
            this.field_editability = node.attrs.field_editability || this.field_editability;
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

            self.by_x_axis_sorted = []
            self.by_y_axis_sorted = []
            self.by_x_axis = {};
            self.by_y_axis = {};
            self.by_id = {};

            return jQuery.when(result).then(function()
            {
                return self.dataset._model.call('fields_get').then(function(fields)
                {
                    self.fields = fields;
                    self.is_numeric = fields[self.field_value].type == 'float';
                    self.show_row_totals &= self.is_numeric;
                    self.show_column_totals &= self.is_numeric;
                    self.x_axis_clickable &= self.is_numeric;
                    self.y_axis_clickable &= self.is_numeric;
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
                    return (new instance.web.Query(self.dataset._model))
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
                            self.add_xy_row(row);
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
                        if(self.is_started && !self.no_rerender)
                        {
                            self.renderElement();
                            self.compute_totals();
                            self.setup_many2one_axes();
                            self.$el.find('.edit').on(
                                    'change', self.proxy(self.xy_value_change));
                            self.effective_readonly_change();
                        }
                        return jQuery.when.apply(jQuery, deferrends);
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
            if(this.by_x_axis_sorted.indexOf(x) == -1)
                this.by_x_axis_sorted.push(x)
            if(this.by_y_axis_sorted.indexOf(y) == -1)
                this.by_y_axis_sorted.push(y)
            this.by_x_axis[x] = this.by_x_axis[x] || {};
            this.by_y_axis[y] = this.by_y_axis[y] || {};
            this.by_x_axis[x][y] = row;
            this.by_y_axis[y][x] = row;
            this.by_id[row.id] = row;
        },

        // get x axis values in the correct order
        get_x_axis_values: function()
        {
            return this.by_x_axis_sorted
        },

        // get y axis values in the correct order
        get_y_axis_values: function()
        {
            return this.by_y_axis_sorted
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
                totals_y = {},
                rows = this.by_id,
                deferred = jQuery.Deferred();
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
            if(this.fields[this.field_value] && this.xy_many2one)
            {
                this.$el.find('tbody tr td[data-x]').addClass('oe_link')
                .click(_.partial(
                    this.proxy(this.xy_axis_click),
                    this.field_value));
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

        xy_axis_click: function(field, e)
        {
            if (!this.get('effective_readonly'))
            {
                var self = this;
                var pop = new instance.web.form.FormOpenPopup(self);
                var context = self.build_context().eval();
                var model_obj = new instance.web.Model(self.field.relation);
                model_obj.call('get_formview_id', [self.get("value"), context]).then(function(view_id){
                    pop.show_element(
                        self.field.relation,
                        self.get_xy_id(
                            jQuery(e.currentTarget).data('x'),
                            jQuery(e.currentTarget).data('y')
                        ),
                        self.build_context(),
                        {
                            title: _t("Open: ") + self.string,
                            view_id: view_id
                        }
                    );
                    pop.on('write_completed', self, function(){
                        self.display_value = {};
                        self.display_value_backup = {};
                        self.render_value();
                        self.focus();
                        self.trigger('changed_value');
                    });
                });
            }

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
            return this._super.apply(this, arguments);
        },

        xy_value_change: function(e)
        {
            var $this = jQuery(e.currentTarget),
                val = $this.val();
            if(this.validate_xy_value(val))
            {
                var data = {}, value = this.parse_xy_value(val);
                data[this.field_value] = value;

                $this.siblings('.read').text(this.format_xy_value(value));
                $this.val(this.format_xy_value(value));

                this.dataset.write($this.data('id'), data);
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
            if(this.xy_many2one){
                this.$el.find('input.widget_x2many_xy').addClass('widget_x2many_hide_xy')
                this.$el.find('span.widget_x2many_xy').removeClass('oe_read_only')
                this.$el.find('span.widget_x2many_xy').removeClass('read')
            }else
            {
                this.$el
                .find('tbody td.oe_list_field_cell span.oe_form_field .edit')
                .toggle(!this.get('effective_readonly'));
                this.$el
                .find('tbody td.oe_list_field_cell span.oe_form_field .read')
                .toggle(this.get('effective_readonly'));
                this.$el.find('.edit').first().focus();
            }

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
