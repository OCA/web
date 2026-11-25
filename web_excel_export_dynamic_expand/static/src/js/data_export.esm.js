import {patch} from "@web/core/utils/patch";
import {ListController} from "@web/views/list/list_controller";
import {useBus} from "@web/core/utils/hooks";

function getExpandDepth(list, depth = 0) {
    if (!list.isGrouped) {
        return depth;
    }
    let maxDepth = depth;
    for (const group of list.groups) {
        if (!group.isFolded && group.list) {
            const childDepth = getExpandDepth(group.list, depth + 1);
            if (childDepth > maxDepth) {
                maxDepth = childDepth;
            }
        }
    }
    return maxDepth;
}

function updateContextWithExpandDepth(model) {
    const root = model && model.root;
    if (root && root.isGrouped && root.groups && root.groups.length > 0) {
        root.config.context = {
            ...root.config.context,
            expand_depth: getExpandDepth(root),
        };
    }
}

patch(ListController.prototype, {
    setup() {
        const searchModel = this.env.searchModel;
        if (searchModel) {
            useBus(searchModel, "direct-export-data", () => {
                updateContextWithExpandDepth(this.model);
            });
        }
        super.setup(...arguments);

        const originalExportRecords = this.exportRecords;
        this.exportRecords = async (...args) => {
            updateContextWithExpandDepth(this.model);
            return originalExportRecords.call(this, ...args);
        };
    },
});
