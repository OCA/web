import {GridCell} from "./grid_cell.esm";
import {registry} from "@web/core/registry";

export class FloatFactorGridCell extends GridCell {}

registry
    .category("grid_view_components")
    .add("float_factor", {component: FloatFactorGridCell});
