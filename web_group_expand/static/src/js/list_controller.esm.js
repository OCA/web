import {ListController} from "@web/views/list/list_controller";
import {patch} from "@web/core/utils/patch";

/**
 * Return the grouped sub-lists of the open groups of the given lists.
 *
 * @param {Array} lists DynamicGroupList datapoints
 * @returns {Array} DynamicGroupList datapoints one level deeper
 */
function nextLayer(lists) {
    return lists
        .flatMap((list) => list.groups)
        .filter((group) => !group.isFolded && group.list.isGrouped)
        .map((group) => group.list);
}

patch(ListController.prototype, {
    async expandAllGroups() {
        // We expand layer by layer. So first we need to find the highest
        // layer that's not already fully expanded.
        let layer = [this.model.root];
        while (layer.length) {
            const closed = layer.some((list) =>
                list.groups.some((group) => group.isFolded)
            );
            if (closed) {
                // This layer is not completely expanded, expand it
                await Promise.all(layer.map((list) => list._toggleAllGroups(false)));
                break;
            }
            // This layer is completely expanded, move to the next
            layer = nextLayer(layer);
        }
    },

    async collapseAllGroups() {
        // We collapse layer by layer. So first we need to find the deepest
        // layer that's not already fully collapsed.
        let layer = [this.model.root];
        while (layer.length) {
            const next = nextLayer(layer).filter((list) =>
                list.groups.some((group) => !group.isFolded)
            );
            if (!next.length) {
                // Next layer is fully collapsed, so collapse this one
                await Promise.all(layer.map((list) => list._toggleAllGroups(true)));
                break;
            }
            layer = next;
        }
    },
});
