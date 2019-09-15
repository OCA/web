/* Copyright 2015 Holger Brunn <hbrunn@therp.nl>
 * Copyright 2016 Pedro M. Baeza <pedro.baeza@tecnativa.com>
 * Copyright 2018 Simone Orsi <simone.orsi@camptocamp.com>
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define('web_widget_x2many_2d_matrix.widget', function (require) {
    "use strict";

    var field_registry = require('web.field_registry');
    var relational_fields = require('web.relational_fields');
    var X2Many2dMatrixRenderer = require(
        'web_widget_x2many_2d_matrix.X2Many2dMatrixRenderer'
    );

    var WidgetX2Many2dMatrix = relational_fields.FieldOne2Many.extend({
        widget_class: 'o_form_field_x2many_2d_matrix',

        /**
         * Initialize the widget & parameters.
         *
         * @param {Object} parent contains the form view.
         * @param {String} name the name of the field.
         * @param {Object} record information about the database records.
         * @param {Object} options view options.
         */
        init: function (parent, name, record, options) {
            this._super(parent, name, record, options);
            this.init_params();
        },

        /**
         * Initialize the widget specific parameters.
         * Sets the axis and the values.
         */
        init_params: function () {
            var node = this.attrs;
            this.by_x_axis = {};
            this.by_y_axis = {};
            this.field_x_axis = node.field_x_axis || this.field_x_axis;
            this.field_y_axis = node.field_y_axis || this.field_y_axis;
            this.field_label_x_axis =
                node.field_label_x_axis || this.field_x_axis;
            this.field_label_y_axis =
                node.field_label_y_axis || this.field_y_axis;
            this.x_axis_clickable = this.parse_boolean(
                node.x_axis_clickable || '1'
            );
            this.y_axis_clickable = this.parse_boolean(
                node.y_axis_clickable || '1'
            );
            this.field_value = node.field_value || this.field_value;
            // TODO: is this really needed? Holger?
            for (var property in node) {
                if (property.startsWith("field_att_")) {
                    this.fields_att[property.substring(10)] =
                        node[property];
                }
            }
            var field_defs = this.recordData[this.name].fields;
            // TODO: raise when any of the fields above don't exist with a
            // helpful error message
            if (!field_defs[this.field_value]) {
                throw new Error(_.str.sprintf(
                    'You need to include %s in your view definition',
                    this.field_value
                ));
            }
            this.show_row_totals = this.parse_boolean(
                node.show_row_totals ||
                this.is_aggregatable(field_defs[this.field_value]) ? '1' : ''
            );
            this.show_column_totals = this.parse_boolean(
                node.show_column_totals ||
                this.is_aggregatable(field_defs[this.field_value]) ? '1' : ''
            );
        },

        /**
         * Initializes the Value matrix.
         *
         * Puts the values in the grid.
         * If we have related items we use the display name.
         */
        init_matrix: function () {
            var records = this.recordData[this.name].data;
            // Wipe the content if something still exists
            this.by_x_axis = {};
            this.by_y_axis = {};
            _.each(records, function (record) {
                var x = record.data[this.field_x_axis],
                    y = record.data[this.field_y_axis];
                if (x.type === 'record') {
                    // We have a related record
                    x = x.data.display_name;
                }
                if (y.type === 'record') {
                    // We have a related record
                    y = y.data.display_name;
                }
                this.by_x_axis[x] = this.by_x_axis[x] || {};
                this.by_y_axis[y] = this.by_y_axis[y] || {};
                this.by_x_axis[x][y] = record;
                this.by_y_axis[y][x] = record;
            }.bind(this));
            // Init columns
            this.columns = [];
            $.each(this.by_x_axis, function (x) {
                this.columns.push(this._make_column(x));
            }.bind(this));
            this.rows = [];
            $.each(this.by_y_axis, function (y) {
                this.rows.push(this._make_row(y));
            }.bind(this));
            this.matrix_data = {
                'field_value': this.field_value,
                'field_x_axis': this.field_x_axis,
                'field_y_axis': this.field_y_axis,
                'columns': this.columns,
                'rows': this.rows,
                'show_row_totals': this.show_row_totals,
                'show_column_totals': this.show_column_totals,
            };
        },

        /**
         * Create scaffold for a column.
         *
         * @param {String} x The string used as a column title
         * @returns {Object}
         */
        _make_column: function (x) {
            return {
                // Simulate node parsed on xml arch
                'tag': 'field',
                'attrs': {
                    'name': this.field_x_axis,
                    'string': x,
                },
            };
        },

        /**
         * Create scaffold for a row.
         *
         * @param {String} y The string used as a row title
         * @returns {Object}
         */
        _make_row: function (y) {
            var self = this;
            // Use object so that we can attach more data if needed
            var row = {
                'tag': 'field',
                'attrs': {
                    'name': this.field_y_axis,
                    'string': y,
                },
                'data': [],
            };
            $.each(self.by_x_axis, function (x) {
                row.data.push(self.by_y_axis[y][x]);
            });
            return row;
        },

        /**
         * Determine if a field represented by field_def can be aggregated
         */
        is_aggregatable: function (field_def) {
            return field_def.type in {float: 1, monetary: 1, integer: 1};
        },

        /**
         * Parse a String containing a bool and convert it to a JS bool.
         *
         * @param {String} val: the string to be parsed.
         * @returns {Boolean} The parsed boolean.
         */
        parse_boolean: function (val) {
            if (val.toLowerCase() === 'true' || val === '1') {
                return true;
            }
            return false;
        },

        /**
         * Create the matrix renderer and add its output to our element
         *
         * @returns {Deferred}
         * A deferred object to be completed when it finished rendering.
         */
        _render: function () {
            if (!this.view) {
                return this._super();
            }
            // Ensure widget is re initiated when rendering
            this.init_matrix();
            var arch = this.view.arch;
            // Update existing renderer
            if (!_.isUndefined(this.renderer)) {
                return this.renderer.updateState(this.value, {
                    matrix_data: this.matrix_data,
                });
            }
            // Create a new matrix renderer
            this.renderer = new X2Many2dMatrixRenderer(this, this.value, {
                arch: arch,
                editable: this.mode === 'edit' && arch.attrs.editable,
                viewType: "list",
                matrix_data: this.matrix_data,
            });
            this.$el.addClass('o_field_x2many o_field_x2many_2d_matrix');
            return this.renderer.appendTo(this.$el);
        },

        /**
         * Activate the widget.
         *
         * @override
         */
        activate: function (options) {
            // Won't work fine without https://github.com/odoo/odoo/pull/26490
            // TODO Use _.propertyOf in underscore 1.9+
            try {
                this._backwards = options.event.data.direction === "previous";
            } catch (error) {
                this._backwards = false;
            }
            var result = this._super.apply(this, arguments);
            delete this._backwards;
            return result;
        },

        /**
         * Get first element to focus.
         *
         * @override
         */
        getFocusableElement: function () {
            return this.$(".o_input:" + (this._backwards ? "last" : "first"));
        },
    });

    field_registry.add('x2many_2d_matrix', WidgetX2Many2dMatrix);

    return {
        WidgetX2Many2dMatrix: WidgetX2Many2dMatrix,
    };
});
