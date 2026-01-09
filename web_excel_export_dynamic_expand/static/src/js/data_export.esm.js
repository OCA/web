import {patch} from "@web/core/utils/patch";
import {ListController} from "@web/views/list/list_controller";

patch(ListController.prototype, {
    async downloadExport() {
        const hasDataRow = document.querySelectorAll(".o_data_row").length > 0;
        const hasGroup = document.querySelectorAll(".o_group_header").length > 0;
        const collapseGroups = !hasDataRow && hasGroup;

        this.props.context = {
            ...this.props.context,
            collapse_groups: collapseGroups,
        };

        await super.downloadExport(...arguments);
    },
});
