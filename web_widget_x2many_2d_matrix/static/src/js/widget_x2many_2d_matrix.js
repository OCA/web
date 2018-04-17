/* Copyright 2015 Holger Brunn <hbrunn@therp.nl>
 * Copyright 2016 Pedro M. Baeza <pedro.baeza@tecnativa.com>
 * Copyright 2018 Simone Orsi <simone.orsi@camptocamp.com>
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define('web_widget_x2many_2d_matrix.widget', function (require) {
  "use strict";

  var core = require('web.core');
  // var FieldManagerMixin = require('web.FieldManagerMixin');
  var field_registry = require('web.field_registry');
  var relational_fields = require('web.relational_fields');
  var weContext = require('web_editor.context');
  // var Helpers = require('web_widget_x2many_2d_matrix.helpers');
  var AbstractField = require('web.AbstractField');
  var X2Many2dMatrixRenderer = require('web_widget_x2many_2d_matrix.X2Many2dMatrixRenderer');

  var WidgetX2Many2dMatrix = relational_fields.FieldOne2Many.extend({
    widget_class: 'o_form_field_x2many_2d_matrix',
    /**
     * Initialize the widget & parameters.
     *
     * @param {Object} parent: contains the form view.
     * @param {String} name: the name of the field.
     * @param {Object} record: Contains the information about the database records.
     * @param {Object} options: Contains the view options.
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
        this.field_label_x_axis = node.field_label_x_axis || this.field_x_axis;
        this.field_label_y_axis = node.field_label_y_axis || this.field_y_axis;
        this.x_axis_clickable = this.parse_boolean(node.x_axis_clickable || '1');
        this.y_axis_clickable = this.parse_boolean(node.y_axis_clickable || '1');
        this.field_value = node.field_value || this.field_value;
        // TODO: is this really needed? Holger?
        for (var property in node) {
          if (property.startsWith("field_att_")) {
              this.fields_att[property.substring(10)] = node[property];
          }
        }
        // and this?
        this.field_editability = node.field_editability || this.field_editability;
        this.show_row_totals = this.parse_boolean(node.show_row_totals || '1');
        this.show_column_totals = this.parse_boolean(node.show_column_totals || '1');

    },
    /**
     * Initializes the Value matrix.
     * Puts the values in the grid. If we have related items we use the display name.
     */
    init_matrix: function(){
      var self = this,
          records = self.recordData[this.name].data;
      // Wipe the content if something still exists
      this.by_x_axis = {};
      this.by_y_axis = {};
      _.each(records, function(record) {
        var x = record.data[self.field_x_axis],
            y = record.data[self.field_y_axis];
        if (x.type == 'record') {
          // we have a related record
          x = x.data.display_name;
        }
        if (y.type == 'record') {
          // we have a related record
          y = y.data.display_name;
        }
        self.by_x_axis[x] = self.by_x_axis[x] || {};
        self.by_y_axis[y] = self.by_y_axis[y] || {};
        self.by_x_axis[x][y] = record;
        self.by_y_axis[y][x] = record;
      });
      // init columns
      self.columns = [];
      $.each(self.by_x_axis, function(x){
        self.columns.push(self._make_column(x));
      });
      self.rows = [];
      $.each(self.by_y_axis, function(y){
        self.rows.push(self._make_row(y));
      });
      self.matrix_data = {
        'field_value': self.field_value,
        'field_x_axis': self.field_x_axis,
        'field_y_axis': self.field_y_axis,
        'columns': self.columns,
        'rows': self.rows,
        'show_row_totals': self.show_row_totals,
        'show_column_totals': self.show_column_totals
      };

    },
    /**
     * Create scaffold for a column.
     *
     * @params {String} x: The string used as a column title
     */
    _make_column: function(x){
      return {
        // simulate node parsed on xml arch
        'tag': 'field',
        'attrs': {
          'name': this.field_x_axis,
          'string': x
        }
      };
    },
    /**
     * Create scaffold for a row.
     *
     * @params {String} x: The string used as a row title
     */
    _make_row: function(y){
      var self = this;
      // use object so that we can attach more data if needed
      var row = {'data': []};
      $.each(self.by_x_axis, function(x) {
        row.data.push(self.by_y_axis[y][x]);
      });
      return row;
    },
    /**
     *Parse a String containing a Python bool or 1 and convert it to a proper bool.
     *
     * @params {String} val: the string to be parsed.
     * @returns {Boolean} The parsed boolean.
     */
    parse_boolean: function(val) {
        if (val.toLowerCase() === 'true' || val === '1') {
            return true;
        }
        return false;
    },
    /**
     *Create the matrix renderer and add its output to our element
     *
     * @returns {Deferred} A deferred object to be completed when it finished rendering.
     */
    _render: function () {
      if (!this.view) {
        return this._super();
      }
      // Ensure widget is re initiated when rendering
      this.init_matrix();
      var arch = this.view.arch,
          viewType = 'list';
      this.renderer = new X2Many2dMatrixRenderer(this, this.value, {
          arch: arch,
          editable: true,
          viewType: viewType,
          matrix_data: this.matrix_data
      });
      this.$el.addClass('o_field_x2many o_field_x2many_2d_matrix');
      // Remove previous rendered and add the newly created one
      this.$el.find('div:not(.o_x2m_control_panel)').remove();
      return this.renderer.appendTo(this.$el);

    }

  });

  field_registry.add('x2many_2d_matrix', WidgetX2Many2dMatrix);

  return {
    WidgetX2Many2dMatrix: WidgetX2Many2dMatrix
  };
});
