import {formatFloat, formatInteger} from "@web/views/fields/formatters";
import {Component} from "@odoo/owl";
import {parseFloat as parseFloatFn} from "@web/views/fields/parsers";
import {registry} from "@web/core/registry";
import {useInputHook} from "../hooks/input_hook.esm";

export class GridCell extends Component {
    static template = "web_grid_view.GridCell";
    static props = {
        cell: {type: Object, optional: true},
        type: {type: String, optional: true},
        row: {type: Object, optional: true},
        isEditing: {type: Boolean, optional: true},
        onCommit: {type: Function, optional: true},
        onNavigate: {type: Function, optional: true},
    };

    setup() {
        this.input = useInputHook({
            getValue: () => this.props.cell?.value || 0,
            parse: parseFloatFn,
            format: (value) => this.formatter(value),
            onCommit: (value) => this.props.onCommit?.(value),
            onNavigate: (key, shift) => this.props.onNavigate?.(key, shift),
        });
    }

    get formatter() {
        return this.props.type === "integer" ? formatInteger : formatFloat;
    }

    get displayValue() {
        if (!this.props.cell) {
            return "";
        }
        return this.formatter(this.props.cell.value);
    }
}

registry.category("grid_view_components").add("integer", {component: GridCell});
registry.category("grid_view_components").add("float", {component: GridCell});
