import {patch} from "@web/core/utils/patch";
import {ListController} from "@web/views/list/list_controller";
import {useBus} from "@web/core/utils/hooks";

function computeCollapseGroups(root) {
    const groups = root.groups; // Undefined/empty for ungrouped lists
    return (
        Array.isArray(groups) && groups.length > 0 && groups.every((g) => g.isFolded)
    );
}

patch(ListController.prototype, {
    setup() {
        const searchModel = this.env.searchModel;
        if (searchModel) {
            useBus(searchModel, "direct-export-data", () => {
                if (this.model && this.model.root) {
                    this.model.root.config.context = {
                        ...this.model.root.config.context,
                        collapse_groups: computeCollapseGroups(this.model.root),
                    };
                }
            });
        }
        super.setup(...arguments);

        const originalExportRecords = this.exportRecords;
        this.exportRecords = async (...args) => {
            if (this.model && this.model.root) {
                this.model.root.config.context = {
                    ...this.model.root.config.context,
                    collapse_groups: computeCollapseGroups(this.model.root),
                };
            }
            return originalExportRecords.call(this, ...args);
        };
    },
});
