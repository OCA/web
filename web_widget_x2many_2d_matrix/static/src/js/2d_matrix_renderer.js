/* Copyright 2018 Simone Orsi <simone.orsi@camptocamp.com>
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define('web_widget_x2many_2d_matrix.X2Many2dMatrixRenderer', function (require) {
  "use strict";

  // heavily inspired by Odoo's `ListRenderer`
  var BasicRenderer = require('web.BasicRenderer');
  var config = require('web.config');
  var field_utils = require('web.field_utils');
  var utils = require('web.utils');
  var FIELD_CLASSES = {
    // copied from ListRenderer
    float: 'o_list_number',
    integer: 'o_list_number',
    monetary: 'o_list_number',
    text: 'o_list_text',
  };

  var X2Many2dMatrixRenderer = BasicRenderer.extend({

    init: function (parent, state, params) {
      this._super.apply(this, arguments);
      this.editable = params.editable;
      this.columns = params.matrix_data.columns;
      this.rows = params.matrix_data.rows;
      this.matrix_data = params.matrix_data;
    },
    /**
     * Main render function for the matrix widget.  It is rendered as a table. For now,
     * this method does not wait for the field widgets to be ready.
     *
     * @override
     * @private
     * returns {Deferred} this deferred is resolved immediately
     */
    _renderView: function () {
      var self = this;

      this.$el
        .removeClass('table-responsive')
        .empty();

      var $table = $('<table>').addClass('o_list_view table table-condensed table-striped');
      this.$el
        .addClass('table-responsive')
        .append($table);

      this._computeColumnAggregates();
      this._computeRowAggregates();

      $table
        .append(this._renderHeader())
        .append(this._renderBody());
      if (self.matrix_data.show_column_totals) {
        $table.append(this._renderFooter());
      }
      return this._super();
    },
    /**
     * Render the table body. Looks for the table body and renders the rows in it.
     * Also it sets the tabindex on every input element.
     *
     * @private
     * return {jQueryElement} The table body element that was just filled.
     */
    _renderBody: function () {
      var $body = $('<tbody>').append(this._renderRows());
      _.each($body.find('input'), function (td, i) {
        $(td).attr('tabindex', i);
      });
      return $body;
    },
    /**
     * Render the table head of our matrix. Looks for the first table head
     * and inserts the header into it.
     *
     * @private
     * @return {jQueryElement} The thead element that was inserted into.
     */
    _renderHeader: function () {
      var $tr = $('<tr>').append('<th/>');
      $tr= $tr.append(_.map(this.columns, this._renderHeaderCell.bind(this)));
      if (this.matrix_data.show_row_totals) {
        $tr.append($('<th/>', {class: 'total'}));
      }
      return $('<thead>').append($tr);
    },
    /**
     * Render a single header cell. Creates a th and adds the description as text.
     *
     * @private
     * @param {jQueryElement} node
     * @returns {jQueryElement} the created <th> node.
     */
    _renderHeaderCell: function (node) {
      var name = node.attrs.name;
      var field = this.state.fields[name];
      var $th = $('<th>');
      if (!field) {
          return $th;
      }
      var description;
      if (node.attrs.widget) {
        description = this.state.fieldsInfo.list[name].Widget.prototype.description;
      }
      if (description === undefined) {
        description = node.attrs.string || field.string;
      }
      $th.text(description).data('name', name);

      if (field.type === 'float' || field.type === 'integer' || field.type === 'monetary') {
        $th.addClass('text-right');
      }

      if (config.debug) {
        var fieldDescr = {
          field: field,
          name: name,
          string: description || name,
          record: this.state,
          attrs: node.attrs,
        };
        this._addFieldTooltip(fieldDescr, $th);
      }
      return $th;
    },
    /**
     * Proxy call to function rendering single row.
     *
     * @private
     * @returns {String} a string with the generated html.
     *
     */

    _renderRows: function () {
      return _.map(this.rows, this._renderRow.bind(this));
    },
    /**
     * Render a single row with all its columns. Renders all the cells and then wraps them with a <tr>.
     * If aggregate is set on the row it also will generate the aggregate cell.
     *
     * @private
     * @param {Object} row: The row that will be rendered.
     * @returns {jQueryElement} the <tr> element that has been rendered.
     */
    _renderRow: function (row) {
      var self = this;
      var $tr = $('<tr/>', {class: 'o_data_row'});
      $tr = $tr.append(self._renderLabelCell(row.data[0]));
      var $cells = _.map(this.columns, function (node, index) {
        var record = row.data[index];
        // make the widget use our field value for each cell
        node.attrs.name = self.matrix_data.field_value;
        return self._renderBodyCell(record, node, index, {mode:''});
      });
      $tr = $tr.append($cells);
      if (row.aggregate) {
        $tr.append(self._renderAggregateRowCell(row));
      }
      return $tr;
    },
    /**
     * Renders the label for a specific row.
     *
     * @private
     * @params {Object} record: Contains the information about the record.
     * @params {jQueryElement} the cell that was rendered.
     */
    _renderLabelCell: function(record) {
      var $td = $('<td>');
      var value = record.data[this.matrix_data.field_y_axis];
      if (value.type == 'record') {
        // we have a related record
        value = value.data.display_name;
      }
      // get 1st column filled w/ Y label
      $td.text(value);
      return $td;
    },
    /**
     * Create a cell and fill it with the aggregate value.
     *
     * @private
     * @param {Object} row: the row object to aggregate.
     * @returns {jQueryElement} The rendered cell.
     */
    _renderAggregateRowCell: function (row) {
      var $cell = $('<td/>', {class: 'row-total text-right'});
      this._apply_aggregate_value($cell, row.aggregate);
      return $cell;
    },
    /**
     * Render a single body Cell.
     * Gets the field and renders the widget. We force the edit mode, since
     * we always want the widget to be editable.
     *
     * @private
     * @param {Object} record: Contains the data for this cell
     * @param {jQueryElement} node: The HTML of the field.
     * @param {int} colIndex: The index of the current column.
     * @param {Object} options: The obtions used for the widget
     * @returns {jQueryElement} the rendered cell.
     */
    _renderBodyCell: function (record, node, colIndex, options) {
      var tdClassName = 'o_data_cell';
      if (node.tag === 'button') {
        tdClassName += ' o_list_button';
      } else if (node.tag === 'field') {
        var typeClass = FIELD_CLASSES[this.state.fields[node.attrs.name].type];
        if (typeClass) {
          tdClassName += (' ' + typeClass);
        }
        if (node.attrs.widget) {
          tdClassName += (' o_' + node.attrs.widget + '_cell');
        }
      }
      // TODO roadmap: here we should collect possible extra params
      // the user might want to attach to each single cell.
      var $td = $('<td>', {
        'class': tdClassName,
        'data-form-id': record.id,
        'data-id': record.data.id,
      });
      // We register modifiers on the <td> element so that it gets the correct
      // modifiers classes (for styling)
      var modifiers = this._registerModifiers(node, record, $td, _.pick(options, 'mode'));
      // If the invisible modifiers is true, the <td> element is left empty.
      // Indeed, if the modifiers was to change the whole cell would be
      // rerendered anyway.
      if (modifiers.invisible && !(options && options.renderInvisible)) {
          return $td;
      }
      options.mode = 'edit';  // enforce edit mode
      var widget = this._renderFieldWidget(node, record, _.pick(options, 'mode'));
      this._handleAttributes(widget.$el, node);
      return $td.append(widget.$el);
    },
    /**
     * Wraps the column aggregate with a tfoot element
     *
     * @private
     * @returns {jQueryElement} The footer element with the cells in it.
     */
    _renderFooter: function () {
      var $cells = this._renderAggregateColCells();
      if ($cells) {
        return $('<tfoot>').append($('<tr>').append('<td/>').append($cells));
      }
      return;
    },
    /**
     * Render the Aggregate cells for the column.
     *
     * @private
     * @returns {List} the rendered cells
     */
    _renderAggregateColCells: function () {
      var self = this;
      return _.map(this.columns, function (column, index) {
        var $cell = $('<td>', {class: 'col-total text-right'});
        if (column.aggregate) {
          self._apply_aggregate_value($cell, column.aggregate);
        }
        return $cell;
      });
    },
    /**
     * Compute the column aggregates.
     * This function is called everytime the value is changed.
     *
     * @private
     */
    _computeColumnAggregates: function () {
      if (!this.matrix_data.show_column_totals) {
        return;
      }
      var self = this,
          fname = this.matrix_data.field_value,
          field = this.state.fields[fname];
      if (!field) { return; }
      var type = field.type;
      if (type !== 'integer' && type !== 'float' && type !== 'monetary') {
        return;
      }
      _.each(self.columns, function (column, index) {
        column.aggregate = {
          fname: fname,
          ftype: type,
          // TODO: translate
          help: 'Sum',
          value: 0
        };
        _.each(self.rows, function (row) {
          // var record = _.findWhere(self.state.data, {id: col.data.id});
          column.aggregate.value += row.data[index].data[fname];
        });
      });
    },
        /**
     * Compute the row aggregates.
     * This function is called everytime the value is changed.
     *
     * @private
     */
    _computeRowAggregates: function () {
      if (!this.matrix_data.show_row_totals) {
        return;
      }
      var self = this,
          fname = this.matrix_data.field_value,
          field = this.state.fields[fname];
      if (!field) { return; }
      var type = field.type;
      if (type !== 'integer' && type !== 'float' && type !== 'monetary') {
          return;
      }
      _.each(self.rows, function (row) {
        row.aggregate = {
          fname: fname,
          ftype: type,
          // TODO: translate
          help: 'Sum',
          value: 0
        };
        _.each(row.data, function (col) {
          row.aggregate.value += col.data[fname];
        });
      });
    },
    /**
     * Takes the given Value, formats it and adds it to the given cell.
     *
     * @private
     * @param {jQueryElement} $cell: The Cell where the aggregate should be added.
     * @param {Object} aggregate: The object which contains the information about the aggregate value
     */
    _apply_aggregate_value: function ($cell, aggregate) {
      var field = this.state.fields[aggregate.fname],
          formatter = field_utils.format[field.type];
      var formattedValue = formatter(aggregate.value, field, {escape: true, });
      $cell.addClass('total').attr('title', aggregate.help).html(formattedValue);
    },
    /**
     * Check if the change was successful and then update the grid.
     * This function is required on relational fields.
     *
     * @params {Object} state: Contains the current state of the field & all the data
     * @params {String} id: the id of the updated object.
     * @params {Array} fields: The fields we have in the view.
     * @params {Object} ev: The event object.
     * @returns {Deferred} The deferred object thats gonna be resolved when the change is made.
     */
    confirmUpdate: function (state, id, fields, ev) {
      var self = this;
      this.state = state;
      return this.confirmChange(state, id, fields, ev).then(function () {
        self._refresh(id);
      });
    },
    /**
     * Refresh our grid.
     *
     * @private
     */
    _refresh: function (id) {
      this._updateRow(id);
      this._refreshColTotals();
      this._refreshRowTotals();
    },
    /**
     *Update row data in our internal rows.
     *
     * @params {String} id: The id of the row that needs to be updated.
     */
    _updateRow: function (id) {
      var self = this,
          record = _.findWhere(self.state.data, {id: id});
      _.each(self.rows, function(row) {
        _.each(row.data, function(col, i) {
          if (col.id == id) {
            row.data[i] = record;
          }
        });
      });
    },
    /**
     * Update the row total.
     */
    _refreshColTotals: function () {
      this._computeColumnAggregates();
      this.$('tfoot').replaceWith(this._renderFooter());
    },
    /**
     * Update the column total.
     */
    _refreshRowTotals: function () {
      var self = this;
      this._computeRowAggregates();
      var $rows = self.$el.find('tr.o_data_row');
      _.each(self.rows, function(row, i) {
        if (row.aggregate) {
          $($rows[i]).find('.row-total')
            .replaceWith(self._renderAggregateRowCell(row));
        }
      });
    },
    /*
    x2m fields expect this
    */
    getEditableRecordID: function (){ return false;}

  });

  return X2Many2dMatrixRenderer;
});
