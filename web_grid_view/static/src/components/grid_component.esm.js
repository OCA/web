import {Component} from "@odoo/owl";
import {GridCell} from "./grid_cell.esm";
import {registry} from "@web/core/registry";

export class GridComponent extends Component {
    static template = "web_grid_view.GridComponent";
    static props = {
        type: {type: String},
        widget: {type: String, optional: true},
        cell: {type: Object, optional: true},
        row: {type: Object, optional: true},
        isEditing: {type: Boolean, optional: true},
        onCommit: {type: Function, optional: true},
        onNavigate: {type: Function, optional: true},
    };

    get componentClass() {
        const components = registry.category("grid_view_components");
        return (
            components.get(this.props.widget, null)?.component ||
            components.get(this.props.type, null)?.component ||
            GridCell
        );
    }
}
