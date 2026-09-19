/** @odoo-module **/

import {TimelineController} from "@web_timeline/views/timeline/timeline_controller.esm";
import {patch} from "@web/core/utils/patch";

/**
 * Translate a namespaced gantt group id back to a group-by default value
 * for record creation. Pure and exported for DOM-free tests.
 *
 * @param {String} group namespaced group id ("grp_<id>" / "rec_<id>" / other)
 * @param {Object[]} records loaded records (rec_ lookup)
 * @param {String} groupedField group-by field name
 * @returns {Number} group-by value id, or -1 (unassigned)
 */
export function remapAddGroup(group, records, groupedField) {
    let match = group.match(/^grp_(\d+)$/);
    if (match) {
        return parseInt(match[1], 10);
    }
    if ((match = group.match(/^rec_(\d+)$/))) {
        const record = (records || []).find((rec) => rec.id === parseInt(match[1], 10));
        const value = record?.[groupedField];
        return Array.isArray(value) ? value[0] : -1;
    }
    return -1;
}

patch(TimelineController.prototype, {
    /**
     * In gantt mode item.group is a namespaced row id ("rec_<id>"), never a
     * valid group-by value: writing it would send e.g. project_id: "rec_42"
     * on every horizontal drag.
     *
     * COUPLING: this reaches into the stock controller's private moveQueue
     * right after super pushed to it (the push is synchronous; the debounced
     * flush happens later). Locked by the controller_move regression test —
     * if an OCA bump reshapes the queue, that test fails loudly instead of
     * every bar drag failing in production.
     *
     * @override
     */
    _onMove(item, callback) {
        super._onMove(item, callback);
        if (this.props.modelParams.gantt_ux) {
            const groupedField = this.model.last_group_bys[0];
            const queued = this.moveQueue[this.moveQueue.length - 1];
            if (queued?.data && groupedField in queued.data) {
                delete queued.data[groupedField];
            }
        }
    },

    /**
     * Double-tap-to-create lands on a namespaced group; translate it back to
     * a real group-by default before the stock handler builds the creation
     * context.
     *
     * @override
     */
    _onAdd(item, callback) {
        if (this.props.modelParams.gantt_ux && typeof item.group === "string") {
            item.group = remapAddGroup(
                item.group,
                this.model.data,
                this.model.last_group_bys[0]
            );
        }
        return super._onAdd(item, callback);
    },
});
