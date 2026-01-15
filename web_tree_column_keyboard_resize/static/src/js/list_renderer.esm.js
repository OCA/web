import {ListRenderer} from "@web/views/list/list_renderer";
import {patch} from "@web/core/utils/patch";

const RESIZE_PIXEL_STEP = 20;

patch(ListRenderer.prototype, {
    // Handle Shift+Arrow keyboard shortcuts for column resizing
    onCellKeydownEditMode(hotkey, cell, group, record) {
        if (hotkey === "shift+arrowup" || hotkey === "shift+arrowdown") {
            const column = this._getColumnFromCell(cell);
            if (column?.name && hotkey === "shift+arrowup") {
                this._expandColumnToContent(column.name, true);
                return true;
            } else if (column?.name && hotkey === "shift+arrowdown") {
                this._expandColumnToContent(column.name, false);
                return true;
            }
        }
        return super.onCellKeydownEditMode(hotkey, cell, group, record);
    },
    // Get column definition from table cell index
    _getColumnFromCell(cell) {
        if (!cell || cell.cellIndex === null) {
            return null;
        }
        return this.columns[cell.cellIndex];
    },
    // Resize column: expand=true increases width, expand=false decreases width
    _expandColumnToContent(columnName, expand) {
        requestAnimationFrame(() => {
            const table = this.tableRef.el;
            if (!table) return;
            // Find the column header by data-name attribute
            const th = table.querySelector(`th[data-name="${columnName}"]`);
            if (!th) return;
            // Calculate new width and apply it to the header
            const delta = expand ? RESIZE_PIXEL_STEP : -RESIZE_PIXEL_STEP;
            const width = `${Math.max(th.scrollWidth + delta)}px`;
            th.style.width = width;
        });
    },
});
