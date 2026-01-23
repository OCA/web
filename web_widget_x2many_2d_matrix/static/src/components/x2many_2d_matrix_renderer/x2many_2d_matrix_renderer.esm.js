import {evaluateBooleanExpr, evaluateExpr} from "@web/core/py_js/py";
import {Component, onWillRender} from "@odoo/owl";
import {Domain} from "@web/core/domain";
import {Record} from "@web/model/relational_model/record";
import {getFieldContext} from "@web/model/relational_model/utils";

export class X2Many2DMatrixRenderer extends Component {
    setup() {
        onWillRender(() => {
            const records = this.list.records;
            this.columns = this._getColumns(records);
            this.rows = this._getRows(records);
            this.matrix = this._getMatrix(records);
        });
    }

    _getFieldInfo(record, fieldName) {
        const value = record.data[fieldName];
        const field = record.fields[fieldName];
        const info = {
            value: value,
            text: (value || "").toString(),
            rawValue: value,
        };
        if (field.type === "many2one") {
            if (Array.isArray(value)) {
                info.text = value[1];
                info.value = value[0];
            } else if (typeof value === "object" && value !== null) {
                info.text = value.display_name || value.name || "";
                info.value = value.id;
            }
        }
        return info;
    }

    _getColumns(records = this.list.records) {
        const columns = [];
        records.forEach((record) => {
            const column = this._getFieldInfo(record, this.matrixFields.x);
            if (columns.findIndex((c) => c.value === column.value) !== -1) return;
            columns.push(column);
        });
        if (this.props.sortX) {
            columns.sort((a, b) => {
                const textA = (a.text || "").toString().toLowerCase();
                const textB = (b.text || "").toString().toLowerCase();
                return textA.localeCompare(textB);
            });
        }
        return columns;
    }

    _getRows(records = this.list.records) {
        const rows = [];
        records.forEach((record) => {
            const row = this._getFieldInfo(record, this.matrixFields.y);
            if (rows.findIndex((r) => r.value === row.value) !== -1) return;
            rows.push(row);
        });
        if (this.props.sortY) {
            rows.sort((a, b) => {
                const textA = (a.text || "").toString().toLowerCase();
                const textB = (b.text || "").toString().toLowerCase();
                return textA.localeCompare(textB);
            });
        }
        return rows;
    }

    _getPointOfRecord(record) {
        const xValue = this._getFieldInfo(record, this.matrixFields.x).value;
        const yValue = this._getFieldInfo(record, this.matrixFields.y).value;

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
    sortX: {type: Boolean, optional: true},
    sortY: {type: Boolean, optional: true},
};
