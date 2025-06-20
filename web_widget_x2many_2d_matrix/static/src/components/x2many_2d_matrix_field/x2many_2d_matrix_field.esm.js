import {Component} from "@odoo/owl";
import {X2Many2DMatrixRenderer} from "@web_widget_x2many_2d_matrix/components/x2many_2d_matrix_renderer/x2many_2d_matrix_renderer.esm";
import {exprToBoolean} from "@web/core/utils/strings";
import {registry} from "@web/core/registry";
import {standardFieldProps} from "@web/views/fields/standard_field_props";

export class X2Many2DMatrixField extends Component {
    setup() {
        this.activeField = this.props.record.activeFields[this.props.name];
    }

    getList() {
        return this.props.record.data[this.props.name];
    }

    get list() {
        return this.getList();
    }

    getListView() {
        return this.props.list_view;
    }

    get list_view() {
        return this.getListView();
    }
}

X2Many2DMatrixField.template = "web_widget_x2many_2d_matrix.X2Many2DMatrixField";
X2Many2DMatrixField.props = {
    ...standardFieldProps,
    list_view: {type: Object, optional: false},
    matrixFields: {type: Object, optional: false},
    isXClickable: {type: Boolean, optional: true},
    isYClickable: {type: Boolean, optional: true},
    showRowTotals: {type: Boolean, optional: true},
    showColumnTotals: {type: Boolean, optional: true},
};

X2Many2DMatrixField.components = {X2Many2DMatrixRenderer};
export const x2Many2DMatrixField = {
    component: X2Many2DMatrixField,
    extractProps({attrs, views}) {
        return {
            list_view: views.list,
            matrixFields: {
                value: attrs.field_value,
                x: attrs.field_x_axis,
                y: attrs.field_y_axis,
            },
            isXClickable: exprToBoolean(attrs.x_axis_clickable),
            isYClickable: exprToBoolean(attrs.y_axis_clickable),
            showRowTotals:
                "show_row_totals" in attrs
                    ? exprToBoolean(attrs.show_row_totals)
                    : true,
            showColumnTotals:
                "show_column_totals" in attrs
                    ? exprToBoolean(attrs.show_column_totals)
                    : true,
        };
    },
};
registry.category("fields").add("x2many_2d_matrix", x2Many2DMatrixField);
