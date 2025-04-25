import {ListController} from "@web/views/list/list_controller";
import {patch} from "@web/core/utils/patch";

function flatten(arr) {
    return arr.reduce((flat, toFlatten) => {
        return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
    }, []);
}

patch(ListController.prototype, {
    async expandAllGroups() {
        // We expand layer by layer. So first we need to find the highest
        // layer that's not already fully expanded.
        let layer = this.model.root.groups;
        let max_length = 0;
        while (layer.length) {
            max_length = Math.max(max_length, layer.length);
            const closed = layer.filter(function (group) {
                return group._config.isFolded;
            });
            if (closed.length) {
                // This layer is not completely expanded, expand it
                await layer.forEach((group) => {
                    group._config.isFolded = false;
                });
                break;
            }
            // This layer is completely expanded, move to the next
            layer = flatten(
                layer.map(function (group) {
                    return group.list.groups || [];
                })
            );
        }
        // Save the default value of MAX_NUMBER_OPENED_GROUPS to restore it later
        const default_max_opened = this.model.constructor.MAX_NUMBER_OPENED_GROUPS;
        // Set in MAX_NUMBER_OPENED_GROUPS the maximum number of groups that can be opened
        this.model.constructor.MAX_NUMBER_OPENED_GROUPS = max_length;
        await this.model.root.load();
        // Restore the default value of MAX_NUMBER_OPENED_GROUPS
        this.model.constructor.MAX_NUMBER_OPENED_GROUPS = default_max_opened;
        this.model.notify();
    },

    async collapseAllGroups() {
        // We collapse layer by layer. So first we need to find the deepest
        // layer that's not already fully collapsed.
        let layer = this.model.root.groups;
        let max_length = 0;
        while (layer.length) {
            max_length = Math.max(max_length, layer.length);
            const next = flatten(
                layer.map(function (group) {
                    return group.list.groups || [];
                })
            ).filter(function (group) {
                return !group._config.isFolded;
            });
            if (!next.length) {
                // Next layer is fully collapsed, so collapse this one
                await layer.forEach((group) => {
                    group._config.isFolded = true;
                });
                break;
            }
            layer = next;
        }
        // Save the default value of MAX_NUMBER_OPENED_GROUPS to restore it later
        const default_max_opened = this.model.constructor.MAX_NUMBER_OPENED_GROUPS;
        // Set in MAX_NUMBER_OPENED_GROUPS the maximum number of groups that can be opened
        this.model.constructor.MAX_NUMBER_OPENED_GROUPS = max_length;
        await this.model.root.load();
        // Restore the default value of MAX_NUMBER_OPENED_GROUPS
        this.model.constructor.MAX_NUMBER_OPENED_GROUPS = default_max_opened;
        this.model.notify();
    },
});
