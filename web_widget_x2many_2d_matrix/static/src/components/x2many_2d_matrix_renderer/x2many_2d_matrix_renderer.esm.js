import {Component, onWillUpdateProps} from "@odoo/owl";
import {evaluateBooleanExpr, evaluateExpr} from "@web/core/py_js/py";
import {Domain} from "@web/core/domain";
import {Record} from "@web/model/relational_model/record";
import {getFieldContext} from "@web/model/relational_model/utils";

export class X2Many2DMatrixRenderer extends Component {
    setup() {
        this.columns = this._getColumns();
        this.rows = this._getRows();
        this.matrix = this._getMatrix();

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
                rawValue: record.data[this.matrixFields.x],
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
                rawValue: record.data[this.matrixFields.y],
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

    get valueFieldComponent() {
        return this.props.list_view.fieldNodes[this.matrixFields.value + "_0"].field
            .component;
    }

    get xFieldComponent() {
        return this.props.list_view.fieldNodes[this.matrixFields.x + "_0"].field
            .component;
    }

    get yFieldComponent() {
        return this.props.list_view.fieldNodes[this.matrixFields.y + "_0"].field
            .component;
    }

    _aggregateRow(row) {
        const y = this.rows.findIndex((r) => r.value === row);
        const total = this.matrix[y].map((r) => r.value).reduce((aggr, x) => aggr + x);
        return total;
    }

    _aggregateColumn(column) {
        const x = this.columns.findIndex((c) => c.value === column);
        const total = this.matrix
            .map((r) => r[x])
            .map((r) => r.value)
            .reduce((aggr, y) => aggr + y);
        return total;
    }

    _aggregateAll() {
        const total = this.matrix
            .map((r) => r.map((x) => x.value).reduce((aggr, x) => aggr + x))
            .reduce((aggr, y) => aggr + y);
        return total;
    }

    _canAggregate() {
        return ["integer", "float", "monetary"].includes(
            this.list.fields[this.matrixFields.value].type
        );
    }

    _getValueFieldProps(column, row) {
        const x = this.columns.findIndex((c) => c.value === column);
        const y = this.rows.findIndex((r) => r.value === row);
        const record = this.matrix[y][x].records[0];

        if (!record) {
            return null;
        }
        return this._getMatrixFieldProps(record, "value");
    }

    _getAxisFieldProps(value, axis) {
        const fieldName = this.matrixFields[axis];
        const record = new Record(this.list.model, this.list._config, {
            [fieldName]: value,
        });
        const props = this._getMatrixFieldProps(record, axis);
        if (this.list.fields[fieldName].type === "many2one") {
            props.canOpen =
                axis === "x" ? this.props.isXClickable : this.props.isYClickable;
        }
        props.readonly = true;
        return props;
    }

    _getAggregateProps(value) {
        const record = new Record(this.list.model, this.list._config, {
            [this.matrixFields.value]: value,
        });
        const props = this._getMatrixFieldProps(record, "value");
        props.readonly = true;
        return props;
    }

    _getMatrixFieldProps(record, fieldName) {
        const fieldInfo =
            this.props.list_view.fieldNodes[this.matrixFields[fieldName] + "_0"];
        const dynamicInfo = {
            get context() {
                return getFieldContext(record, fieldInfo.name, fieldInfo.context);
            },
            domain() {
                const evalContext = record.evalContext;
                if (fieldInfo.domain) {
                    return new Domain(
                        evaluateExpr(fieldInfo.domain, evalContext)
                    ).toList();
                }
            },
            required: evaluateBooleanExpr(
                fieldInfo.required,
                record.evalContextWithVirtualIds
            ),
            readonly:
                this.props.readonly ||
                evaluateBooleanExpr(
                    fieldInfo.readonly,
                    record.evalContextWithVirtualIds
                ),
        };
        const result = {
            readonly: dynamicInfo.readonly,
            record: record,
            name: this.matrixFields[fieldName],
            ...(fieldInfo.field.extractProps || (() => ({}))).apply(fieldInfo.field, [
                fieldInfo,
                dynamicInfo,
            ]),
        };
        return result;
    }
}

X2Many2DMatrixRenderer.template = "web_widget_x2many_2d_matrix.X2Many2DMatrixRenderer";
X2Many2DMatrixRenderer.props = {
    list: {type: Object, optional: false},
    list_view: {type: Object, optional: false},
    matrixFields: {type: Object, optional: false},
    readonly: {type: Boolean, optional: true},
    domain: {type: [Array, Function], optional: true},
    showRowTotals: {type: Boolean, optional: true},
    showColumnTotals: {type: Boolean, optional: true},
    isXClickable: {type: Boolean, optional: true},
    isYClickable: {type: Boolean, optional: true},
};
