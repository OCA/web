/* Copyright 2018 Simone Orsi <simone.orsi@camptocamp.com>
 * Copyright 2018 Brainbean Apps
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define('web_widget_x2many_2d_matrix.X2Many2dMatrixRenderer', function (require) {
    "use strict";

    var BasicRenderer = require('web.BasicRenderer');
    var config = require('web.config');
    var core = require('web.core');
    var field_utils = require('web.field_utils');
    var _t = core._t;
    
    var FIELD_CLASSES = {
        float: 'o_list_number',
        integer: 'o_list_number',
        monetary: 'o_list_number',
        text: 'o_list_text',
    };

    // X2Many2dMatrixRenderer is heavily inspired by Odoo's ListRenderer
    // and is reusing portions of code from list_renderer.js
    var X2Many2dMatrixRenderer = BasicRenderer.extend({

        /**
         * @override
         */
        init: function (parent, state, params) {
            this._super.apply(this, arguments);
            this.editable = params.editable;
            this._saveMatrixData(params.matrix_data);
        },

        /**
         * Update matrix data in current renderer instance.
         *
         * @param {Object} matrixData Contains the matrix data
         */
        _saveMatrixData: function (matrixData) {
            this.columns = matrixData.columns;
            this.rows = matrixData.rows;
            this.matrix_data = matrixData;
        },

        /**
         * Main render function for the matrix widget.
         *
         * It is rendered as a table. For now,
         * this method does not wait for the field widgets to be ready.
         *
         * @override
         * @private
         * @returns {Deferred} this deferred is resolved immediately
         */
        _renderView: function () {
            var self = this;

            this.$el
                .removeClass('table-responsive')
                .empty();

            // Display a nice message if there's no data to display
            if (!self.rows.length) {
                var $alert = $('<div>', {'class': 'alert alert-info'});
                $alert.text(_t('Sorry no matrix data to display.'));
                this.$el.append($alert);
                return this._super();
            }

            var $table = $('<table>').addClass(
                'o_list_view table table-condensed table-striped ' +
                'o_x2many_2d_matrix '
            );
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
         * Render the table body.
         *
         * Looks for the table body and renders the rows in it.
         * Also it sets the tabindex on every input element.
         *
         * @private
         * @returns {jQueryElement} The table body element just filled.
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
         * @returns {jQueryElement} The thead element that was inserted into.
         */
        _renderHeader: function () {
            var $tr = $('<tr>').append('<th/>');
            $tr = $tr.append(_.map(
                this.columns,
                this._renderHeaderCell.bind(this)
            ));
            if (this.matrix_data.show_row_totals) {
                $tr.append($('<th/>', {class: 'total'}));
            }
            return $('<thead>').append($tr);
        },

        /**
         * Render a single header cell.
         *
         * Creates a th and adds the description as text.
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
            var description = null;
            if (node.attrs.widget) {
                description = this.state.fieldsInfo.list[name]
                    .Widget.prototype.description;
            }
            if (_.isNull(description)) {
                description = node.attrs.string || field.string;
            }
            $th.text(description).data('name', name);

            if (
                field.type === 'float' || field.type === 'integer' ||
                field.type === 'monetary'
            ) {
                $th.addClass('text-right');
            } else {
                $th.addClass('text-center');
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
         */
        _renderRows: function () {
            return _.map(this.rows, function (row) {
                row.attrs.name = this.matrix_data.field_value;
                return this._renderRow(row);
            }.bind(this));
        },

        /**
         * Render a single row with all its columns.
         * Renders all the cells and then wraps them with a <tr>.
         * If aggregate is set on the row it also will generate
         * the aggregate cell.
         *
         * @private
         * @param {Object} row The row that will be rendered.
         * @returns {jQueryElement} the <tr> element that has been rendered.
         */
        _renderRow: function (row) {
            var $tr = $('<tr/>', {class: 'o_data_row'}),
                _data = _.without(row.data, undefined);
            $tr = $tr.append(this._renderLabelCell(_data[0]));
            var $cells = _.map(this.columns, function (column, index) {
                var record = row.data[index];
                // Make the widget use our field value for each cell
                column.attrs.name = this.matrix_data.field_value;
                return this._renderBodyCell(record, column, index, {mode:''});
            }.bind(this));
            $tr = $tr.append($cells);
            if (row.aggregate) {
                $tr.append(this._renderAggregateRowCell(row));
            }
            return $tr;
        },

        /**
         * Renders the label for a specific row.
         *
         * @private
         * @param {Object} record Contains the information about the record.
         * @returns {jQueryElement} the cell that was rendered.
         */
        _renderLabelCell: function (record) {
            var $td = $('<td>');
            var value = record.data[this.matrix_data.field_y_axis];
            if (value.type === 'record') {
                // We have a related record
                value = value.data.display_name;
            }
            // Get 1st column filled w/ Y label
            $td.text(value);
            return $td;
        },

        /**
         * Create a cell and fill it with the aggregate value.
         *
         * @private
         * @param {Object} row the row object to aggregate.
         * @returns {jQueryElement} The rendered cell.
         */
        _renderAggregateRowCell: function (row) {
            var $cell = $('<td/>', {class: 'row-total'});
            this.applyAggregateValue($cell, row);
            return $cell;
        },

        /**
         * Render a single body Cell.
         * Gets the field and renders the widget. We force the edit mode, since
         * we always want the widget to be editable.
         *
         * @private
         * @param {Object} record Contains the data for this cell
         * @param {jQueryElement} node The HTML of the field.
         * @param {int} colIndex The index of the current column.
         * @param {Object} options The obtions used for the widget
         * @returns {jQueryElement} the rendered cell.
         */
        _renderBodyCell: function (record, node, colIndex, options) {
            var tdClassName = 'o_data_cell';
            if (node.tag === 'field') {
                var typeClass = FIELD_CLASSES[
                    this.state.fields[node.attrs.name].type
                ];
                if (typeClass) {
                    tdClassName += ' ' + typeClass;
                }
                if (node.attrs.widget) {
                    tdClassName += ' o_' + node.attrs.widget + '_cell';
                }
            }

            // TODO roadmap: here we should collect possible extra params
            // the user might want to attach to each single cell.

            var $td = $('<td>', {
                'class': tdClassName,
            });

            if (_.isUndefined(record)) {
                // Without record, nothing elese to do
                return $td;
            }
            $td.attr({
                'data-form-id': record.id,
                'data-id': record.data.id,
            });

            // We register modifiers on the <td> element so that it gets
            // the correct modifiers classes (for styling)
            var modifiers = this._registerModifiers(
                node,
                record,
                $td,
                _.pick(options, 'mode')
            );
            // If the invisible modifiers is true, the <td> element is
            // left empty. Indeed, if the modifiers was to change the
            // whole cell would be rerendered anyway.
            if (modifiers.invisible && !(options && options.renderInvisible)) {
                return $td;
            }

            // Enforce mode of the parent
            options.mode = this.getParent().mode;

            if (node.tag === 'widget') {
                return $td.append(this._renderWidget(record, node));
            }
            var $el = this._renderFieldWidget(node, record, _.pick(options, 'mode'));
            this._handleAttributes($el, node);
            return $td.append($el);
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
                var $tr = $('<tr>').append('<td/>').append($cells);
                var $total_cell = this._renderTotalCell();
                if ($total_cell) {
                    $tr.append($total_cell);
                }
                return $('<tfoot>').append($tr);
            }
        },

        /**
         * Renders the total cell (of all rows / columns)
         *
         * @private
         * @returns {jQueryElement} The td element with the total in it.
         */
        _renderTotalCell: function () {
            if (!this.matrix_data.show_column_totals ||
                !this.matrix_data.show_row_totals) {
                return;
            }

            var $cell = $('<td>', {class: 'col-total'});
            this.applyAggregateValue($cell, this.total);
            return $cell;
        },

        /**
         * Render the Aggregate cells for the column.
         *
         * @private
         * @returns {List} the rendered cells
         */
        _renderAggregateColCells: function () {
            var self = this;

            return _.map(this.columns, function (column) {
                var $cell = $('<td>');
                if (config.debug) {
                    $cell.addClass(column.attrs.name);
                }
                if (column.aggregate) {
                    self.applyAggregateValue($cell, column)
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
            var fname = this.matrix_data.field_value,
                field = this.state.fields[fname];
            if (!field) {
                return;
            }
            var type = field.type;
            if (!~['integer', 'float', 'monetary'].indexOf(type)) {
                return;
            }
            this.total = {
                attrs: {
                    name: fname,
                },
                aggregate: {
                    help: _t('Sum Total'),
                    value: 0,
                },
            };
            _.each(this.columns, function (column, index) {
                column.aggregate = {
                    help: _t('Sum'),
                    value: 0,
                };
                _.each(this.rows, function (row) {
                    // TODO Use only one _.propertyOf in underscore 1.9.0+
                    try {
                        column.aggregate.value += row.data[index].data[fname];
                    } catch (error) {
                        // Nothing to do
                    }
                });
                this.total.aggregate.value += column.aggregate.value;
            }.bind(this));
        },

        /**
         * @override
         */
        updateState: function (state, params) {
            if (params.matrix_data) {
                this._saveMatrixData(params.matrix_data);
            }
            return this._super.apply(this, arguments);
        },

        /**
        * Traverse the fields matrix with the keyboard
        *
        * @override
        * @private
        * @param {OdooEvent} event "navigation_move" event
        */
        _onNavigationMove: function (event) {
            var widgets = this.__parentedChildren,
                index = widgets.indexOf(event.target),
                first = index === 0,
                last = index === widgets.length - 1,
                move = 0;
            // Guess if we have to move the focus
            if (event.data.direction === "next" && !last) {
                move = 1;
            } else if (event.data.direction === "previous" && !first) {
                move = -1;
            }
            // Move focus
            if (move) {
                var target = widgets[index + move];
                index = this.allFieldWidgets[target.record.id].indexOf(target);
                this._activateFieldWidget(target.record, index, {inc: 0});
                event.stopPropagation();
            }
        },

        /**
         * Compute the row aggregates.
         *
         * This function is called everytime the value is changed.
         *
         * @private
         */
        _computeRowAggregates: function () {
            if (!this.matrix_data.show_row_totals) {
                return;
            }
            var fname = this.matrix_data.field_value,
                field = this.state.fields[fname];
            if (!field) {
                return;
            }
            var type = field.type;
            if (!~['integer', 'float', 'monetary'].indexOf(type)) {
                return;
            }
            _.each(this.rows, function (row) {
                row.aggregate = {
                    help: _t('Sum'),
                    value: 0,
                };
                _.each(row.data, function (col) {
                    // TODO Use _.property in underscore 1.9+
                    try {
                        row.aggregate.value += col.data[fname];
                    } catch (error) {
                        // Nothing to do
                    }
                });
            });
        },

        /**
         * Takes the given Value, formats it and adds it to the given cell.
         *
         * @private
         *
         * @param {jQueryElement} $cell
         * The Cell where the aggregate should be added.
         *
         * @param {Object} axis
         * The object which contains the information about the aggregate value axis
         */
        applyAggregateValue: function ($cell, axis) {
            var field = this.state.fields[axis.attrs.name];
            var value = axis.aggregate.value;
            var help = axis.aggregate.help;
            var fieldInfo = this.state.fieldsInfo.list[axis.attrs.name];
            var formatFunc = field_utils.format[
                fieldInfo.widget ? fieldInfo.widget : field.type
            ];
            var formattedValue = formatFunc(value, field, { escape: true });
            $cell.addClass('o_list_number').attr('title', help).html(formattedValue);
        },

        /**
         * Check if the change was successful and then update the grid.
         * This function is required on relational fields.
         *
         * @param {Object} state
         * Contains the current state of the field & all the data
         *
         * @param {String} id
         * the id of the updated object.
         *
         * @param {Array} fields
         * The fields we have in the view.
         *
         * @param {Object} ev
         * The event object.
         *
         * @returns {Deferred}
         * The deferred object thats gonna be resolved when the change is made.
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
         * @param {String} id Datapoint ID
         */
        _refresh: function (id) {
            this._updateRow(id);
            this._refreshColTotals();
            this._refreshRowTotals();
        },

        /**
         *Update row data in our internal rows.
         *
         * @param {String} id: The id of the row that needs to be updated.
         */
        _updateRow: function (id) {
            var record = _.findWhere(this.state.data, {id: id}),
                _id = _.property("id");
            _.each(this.rows, function (row) {
                _.each(row.data, function (col, i) {
                    if (_id(col) === id) {
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
            _.each(self.rows, function (row, i) {
                if (row.aggregate) {
                    $($rows[i]).find('.row-total')
                        .replaceWith(self._renderAggregateRowCell(row));
                }
            });
        },

        /**
         * X2many fields expect this
         *
         * @returns {null}
         */
        getEditableRecordID: function () {
            return null;
        },

    });

    return X2Many2dMatrixRenderer;
});
