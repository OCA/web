import {ListRenderer} from "@web/views/list/list_renderer";
import {patch} from "@web/core/utils/patch";

patch(ListRenderer.prototype, {
    isSortable(column) {
        return super.isSortable(column) && !column.options.unsortable;
    },
});
