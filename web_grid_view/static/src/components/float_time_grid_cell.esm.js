import {GridCell} from "./grid_cell.esm";
import {formatFloatTime} from "@web/views/fields/formatters";
import {registry} from "@web/core/registry";

export class FloatTimeGridCell extends GridCell {
    get formatter() {
        return formatFloatTime;
    }
}

registry
    .category("grid_view_components")
    .add("float_time", {component: FloatTimeGridCell});
