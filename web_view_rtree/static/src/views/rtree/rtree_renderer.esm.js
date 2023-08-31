/** @odoo-module **/

import {ListRenderer} from "@web/views/list/list_renderer";

export class RTreeRenderer extends ListRenderer {
    getGroupLevel(group) {
        return group.level;
    }

    getGroupNameCellColSpan(group) {
        const colspan = super.getGroupNameCellColSpan(group);
        if (this.hasSelectors) {
            return colspan + 1;
        }
        return colspan;
    }

    isFirstColumn(column) {
        return this.state.columns.findIndex((col) => col === column) === 0;
    }
}

RTreeRenderer.rowsTemplate = "web_view_rtree.RTreeRenderer.Rows";
RTreeRenderer.recordRowTemplate = "web_view_rtree.RTreeRenderer.RecordRow";
ListRenderer.groupRowTemplate = "web_view_rtree.RTreeRenderer.GroupRow";
