/** @odoo-module **/

import {Component, onWillUpdateProps} from "@odoo/owl";
import {registry} from "@web/core/registry";
const fieldRegistry = registry.category("fields");

export class X2Many2DMatrixRenderer extends Component {
    setup() {
        this.ValueFieldComponent = this._getValueFieldComponent();
        this.columns = this._getColumns();
        this.rows = this._getRows();
        this.matrix = this._getMatrix();
        this.ValueFieldType = this._getValueFieldType();

        onWillUpdateProps((newProps) => {
            this.columns = this._getColumns(newProps.list.records);
            this.rows = this._getRows(newProps.list.records);
            this.matrix = this._getMatrix(newProps.list.records);
        });
    }

    _getColumns(records = this.list.records) {
        const columns = [];
        records.forEach((record) => {
            const column = {
                value: record.data[this.matrixFields.x],
                text: record.data[this.matrixFields.x],
            };
            if (record.fields[this.matrixFields.x].type === "many2one") {
                column.text = column.value[1];
                column.value = column.value[0];
            }
            if (columns.findIndex((c) => c.value === column.value) !== -1) return;
            columns.push(column);
        });
        return columns;
    }

    _getRows(records = this.list.records) {
        const rows = [];
        records.forEach((record) => {
            const row = {
                value: record.data[this.matrixFields.y],
                text: record.data[this.matrixFields.y],
            };
            if (record.fields[this.matrixFields.y].type === "many2one") {
                row.text = row.value[1];
                row.value = row.value[0];
            }
            if (rows.findIndex((r) => r.value === row.value) !== -1) return;
            rows.push(row);
        });
        return rows;
    }

    _getPointOfRecord(record) {
        let xValue = record.data[this.matrixFields.x];
        if (record.fields[this.matrixFields.x].type === "many2one") {
            xValue = xValue[0];
        }
        let yValue = record.data[this.matrixFields.y];
        if (record.fields[this.matrixFields.y].type === "many2one") {
            yValue = yValue[0];
        }

        const x = this.columns.findIndex((c) => c.value === xValue);
        const y = this.rows.findIndex((r) => r.value === yValue);
        return {x, y};
    }

    _getMatrix(records = this.list.records) {
        const matrix = this.rows.map(() =>
            new Array(this.columns.length).fill(null).map(() => {
                return {value: 0, records: []};
            })
        );
        records.forEach((record) => {
            const value = record.data[this.matrixFields.value];
            const {x, y} = this._getPointOfRecord(record);
            matrix[y][x].value += value;
            matrix[y][x].records.push(record);
        });
        return matrix;
    }

    get list() {
        return this.props.list;
    }

    get matrixFields() {
        return this.props.matrixFields;
    }

    _getValueFieldComponent() {
        const field = this.list.fields[this.matrixFields.value];
        if (!field.widget) {
            return fieldRegistry.get(field.type).component;
        }
        return fieldRegistry.get(field.widget).component;
    }

    _getValueFieldType() {
        const field = this.list.fields[this.matrixFields.value];
        return field.type;
    }

    _aggregateRow(row) {
        const y = this.rows.findIndex((r) => r.value === row);
        const total = this.matrix[y].map((r) => r.value).reduce((aggr, x) => aggr + x);
        if (this.ValueFieldType === "integer") {
            return total;
        }
        return Number(total).toFixed(2);
    }

    _aggregateColumn(column) {
        const x = this.columns.findIndex((c) => c.value === column);

        const total = this.matrix
            .map((r) => r[x])
            .map((r) => r.value)
            .reduce((aggr, y) => aggr + y);
        if (this.ValueFieldType === "integer") {
            return total;
        }
        return Number(total).toFixed(2);
    }

    _aggregateAll() {
        const total = this.matrix
            .map((r) => r.map((x) => x.value).reduce((aggr, x) => aggr + x))
            .reduce((aggr, y) => aggr + y);
        if (this.ValueFieldType === "integer") {
            return total;
        }
        return Number(total).toFixed(2);
    }

    _canAggregate() {
        return ["integer", "float", "monetary"].includes(
            this.list.fields[this.matrixFields.value].type
        );
    }

    getValueFieldProps(column, row) {
        const x = this.columns.findIndex((c) => c.value === column);
        const y = this.rows.findIndex((r) => r.value === row);
        let record = null;
        let value = null;
        if (
            this.matrix[y] &&
            this.matrix[y][x] &&
            (record = this.matrix[y][x].records[0])
        ) {
            record = this.matrix[y][x].records[0];
            value = this.matrix[y][x].value;
        }
        value = record ? record.data[this.matrixFields.value] : value;
        this.matrix[y][x].value = value;
        const result = {
            readonly: this.props.readonly,
            record: record,
            name: this.matrixFields.value,
        };
        if (value === null) {
            result.readonly = true;
        }
        return result;
    }
}

X2Many2DMatrixRenderer.template = "web_widget_x2many_2d_matrix.X2Many2DMatrixRenderer";
X2Many2DMatrixRenderer.props = {
    list: {type: Object, optional: true},
    matrixFields: {type: Object, optional: true},
    readonly: {type: Boolean, optional: true},
    showRowTotals: {type: Boolean, optional: true},
    showColumnTotals: {type: Boolean, optional: true},
};
