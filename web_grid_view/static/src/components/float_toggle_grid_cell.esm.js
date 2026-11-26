import {Component} from "@odoo/owl";
import {registry} from "@web/core/registry";

export class FloatToggleGridCell extends Component {
    static template = "web_grid_view.FloatToggleGridCell";
    static props = {
        cell: {type: Object, optional: true},
        type: {type: String, optional: true},
        row: {type: Object, optional: true},
        isEditing: {type: Boolean, optional: true},
        onCommit: {type: Function, optional: true},
        onNavigate: {type: Function, optional: true},
    };

    static rangeValues = [0, 0.5, 1];

    get currentIdx() {
        const value = this.props.cell?.value || 0;
        const idx = this.constructor.rangeValues.indexOf(value);
        return idx >= 0 ? idx : 0;
    }

    onClick() {
        const values = this.constructor.rangeValues;
        const nextIdx = (this.currentIdx + 1) % values.length;
        this.props.onCommit?.(values[nextIdx]);
    }
}

registry
    .category("grid_view_components")
    .add("float_toggle", {component: FloatToggleGridCell});
