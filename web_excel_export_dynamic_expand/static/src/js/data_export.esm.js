import {patch} from "@web/core/utils/patch";
import {ListController} from "@web/views/list/list_controller";

patch(ListController.prototype, {
    async downloadExport() {
        const root = this.model.root;
        if (root.isGrouped && root.groups && root.groups.length > 0) {
            const expandDepth = this._getExpandDepth(root);
            this.props.context = {
                ...this.props.context,
                expand_depth: expandDepth,
            };
        }
        await super.downloadExport(...arguments);
    },

    _getExpandDepth(list, depth = 0) {
        if (!list.isGrouped) {
            return depth;
        }
        let maxDepth = depth;
        for (const group of list.groups) {
            if (!group.isFolded && group.list) {
                const childDepth = this._getExpandDepth(group.list, depth + 1);
                if (childDepth > maxDepth) {
                    maxDepth = childDepth;
                }
            }
        }
        return maxDepth;
    },
});
