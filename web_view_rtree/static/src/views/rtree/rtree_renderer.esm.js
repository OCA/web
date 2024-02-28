/** @odoo-module **/

import {ListRenderer} from "@web/views/list/list_renderer";

export class RTreeRenderer extends ListRenderer {
    getActiveColumns() {
        // Overriding this because handles should be displayed.
        return this.allColumns.filter((col) => {
            return !col.optional || this.optionalActiveFields[col.name];
        });
    }

    getGroupLevel(group) {
        return group.level;
    }

    getGroupNameCellColSpan(group) {
        let colspan = super.getGroupNameCellColSpan(group);
        // When selectors are enabled or when the first column uses a handle
        // widget, empty cells are added at the beginning of group rows to
        // align their contents with those of record rows.
        if (this.hasSelectors) {
            colspan -= 1;
        }
        if (this.firstColumnIsHandle) {
            colspan -= 1;
        }
        return colspan;
    }

    get firstColumnIsHandle() {
        return this.state.columns[0].widget === "handle";
    }

    isFirstColumn(column) {
        // Check whether this column is the first column that doesn’t use a
        // handle widget.
        let firstColumnIndex = 0;
        if (this.firstColumnIsHandle) {
            firstColumnIndex = 1;
        }
        return (
            this.state.columns.findIndex((col) => col === column) === firstColumnIndex
        );
    }

    openGroupRecord(group) {
        if (!this.props.archInfo.noOpen) {
            this.props.openRecord(group);
        }
    }

    onCellKeydownReadOnlyMode(hotkey, cell, group, record) {
        const cellIsInGroupRow = Boolean(group && !record);
        if (cellIsInGroupRow && hotkey === "enter") {
            // Open the group record form instead of toggling the group.
            return this.openGroupRecord(group);
        }
        return super.onCellKeydownReadOnlyMode(hotkey, cell, group, record);
    }

    // This is to avoid the parent method to try to access the non-existing
    // this.props.list.groups.
    get aggregates() {
        return {};
    }
}

RTreeRenderer.rowsTemplate = "web_view_rtree.RTreeRenderer.Rows";
RTreeRenderer.recordRowTemplate = "web_view_rtree.RTreeRenderer.RecordRow";
RTreeRenderer.groupRowTemplate = "web_view_rtree.RTreeRenderer.GroupRow";
