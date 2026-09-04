import {Component} from "@odoo/owl";
import {registry} from "@web/core/registry";

export class Many2OneGridRow extends Component {
    static template = "web_grid_view.Many2OneGridRow";
    static props = {
        row: {type: Object},
    };
}

registry
    .category("grid_view_row_components")
    .add("many2one", {component: Many2OneGridRow});
