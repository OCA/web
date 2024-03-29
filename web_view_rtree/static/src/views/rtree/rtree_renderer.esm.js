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

    getColumns(record) {
        if (record.isRecord) {
            return this.state.columns;
        }
        const columns = [];
        const firstNonWidgetColumn = this.getFirstNonWidgetColumn();
        for (const column of this.state.columns) {
            const col = {...column};
            if (!(column.name in record.activeFields)) {
                if (column === firstNonWidgetColumn) {
                    col.name = "display_name";
                } else {
                    col.type = "placeholder";
                }
            }
            columns.push(col);
        }
        return columns;
    }

    getFirstNonWidgetColumn() {
        for (const column of this.state.columns) {
            if (!column.widget) {
                return column;
            }
        }
        return {id: null};
    }

    isFirstNonWidgetColumn(column) {
        return column.id === this.getFirstNonWidgetColumn().id;
    }

    // This is to avoid the parent method to try to access the non-existing
    // this.props.list.groups.
    get aggregates() {
        return {};
    }
}

RTreeRenderer.rowsTemplate = "web_view_rtree.RTreeRenderer.Rows";
RTreeRenderer.recordRowTemplate = "web_view_rtree.RTreeRenderer.RecordRow";
