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
}

X2Many2DMatrixField.template = "web_widget_x2many_2d_matrix.X2Many2DMatrixField";
X2Many2DMatrixField.props = {
    ...standardFieldProps,
    list: {type: Object, optional: true},
    matrixFields: {type: Object, optional: true},
    isXClickable: {type: Boolean, optional: true},
    isYClickable: {type: Boolean, optional: true},
    showRowTotals: {type: Boolean, optional: true},
    showColumnTotals: {type: Boolean, optional: true},
    canOpen: {type: Boolean, optional: true},
    canCreate: {type: Boolean, optional: true},
    canWrite: {type: Boolean, optional: true},
    canQuickCreate: {type: Boolean, optional: true},
    canCreateEdit: {type: Boolean, optional: true},
};

X2Many2DMatrixField.components = {X2Many2DMatrixRenderer};
export const x2Many2DMatrixField = {
    component: X2Many2DMatrixField,
    extractProps({attrs, options}) {
        const hasCreatePermission = attrs.can_create
            ? exprToBoolean(attrs.can_create)
            : true;
        const hasWritePermission = attrs.can_write
            ? exprToBoolean(attrs.can_write)
            : true;
        const canCreate = options.no_create ? false : hasCreatePermission;
        return {
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
            canOpen: !options.no_open,
            canCreate,
            canWrite: hasWritePermission,
            canQuickCreate: canCreate && !options.no_quick_create,
            canCreateEdit: canCreate && !options.no_create_edit,
        };
    },
};
registry.category("fields").add("x2many_2d_matrix", x2Many2DMatrixField);
