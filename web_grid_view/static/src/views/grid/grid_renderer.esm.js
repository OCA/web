import {Component, onMounted, useRef, useState} from "@odoo/owl";
import {useService} from "@web/core/utils/hooks";
import {FormViewDialog} from "@web/views/view_dialogs/form_view_dialog";
import {GridComponent} from "../../components/grid_component.esm";
import {GridRow} from "../../components/grid_row.esm";
import {registry} from "@web/core/registry";

export class GridRenderer extends Component {
    static template = "web_grid_view.GridRenderer";
    static components = {GridComponent};
    static props = {
        model: {type: Object},
        onCellEdit: {type: Function, optional: true},
        onCellCommit: {type: Function, optional: true},
        onCellNavigate: {type: Function, optional: true},
    };

    setup() {
        this.model = this.props.model;
        this.state = useState({
            hoveredRow: null,
            hoveredCol: null,
            editingRow: null,
            editingCol: null,
        });
        this.actionService = useService("action");
        this.dialogService = useService("dialog");
        this.gridRef = useRef("grid");
        onMounted(() => this._focusOnToday());
    }

    get hasData() {
        const m = this.model;
        return m.hasSections ? m.sections.length > 0 : m.rows.length > 0;
    }

    get visibleColumns() {
        const cols = this.model.columns || [];
        return cols.filter((c) => !c.isWeekend || this.model.showWeekends);
    }

    get allRows() {
        return this.model.hasSections ? this.model.sections : this.model.rows;
    }

    get gridTemplateColumns() {
        const n = this.visibleColumns.length;
        const colWidth = n > 7 ? "minmax(8ch, auto)" : "minmax(10ch, 1fr)";
        return `auto repeat(${n}, ${colWidth}) minmax(10ch, 10em)`;
    }

    get grandTotal() {
        return this.visibleColumns.reduce((sum, col) => sum + (col.grandTotal || 0), 0);
    }

    get maxColumnTotal() {
        return Math.max(1, ...this.visibleColumns.map((c) => c.grandTotal));
    }

    openRecords(rowId, colId) {
        const row = this.model.hasSections
            ? this._findRowInSection(rowId)
            : this.model.rows.find((r) => r.id === rowId);
        if (!row || !row.cells[colId]) return;
        const cell = row.cells[colId];
        this.actionService.doAction({
            type: "ir.actions.act_window",
            name:
                row.label +
                " - " +
                (this.model.columns.find((c) => c.id === colId)?.label || ""),
            res_model: this.model.resModel,
            views: [
                [false, "list"],
                [false, "form"],
            ],
            domain: cell.domain,
        });
    }

    _findRowInSection(rowId) {
        for (const section of this.model.sections) {
            const row = section.rows.find((r) => r.id === rowId);
            if (row) return row;
        }
        return null;
    }

    onCreateLine(section) {
        const ctx = {default_date: this.model.periodStart.toISODate()};
        if (section) ctx.default_category = section.label;
        this.dialogService.add(FormViewDialog, {
            resModel: this.model.resModel,
            context: ctx,
            title: "Add a Line",
            onRecordSaved: async () => {
                await this.model.load(this.model._searchParams);
            },
        });
    }

    getCellColorClass(value) {
        if (value === undefined || value === null) return "";
        const num = Number(value);
        if (num >= 6) return "text-success fw-medium";
        if (num > 0 && num < 3) return "text-warning";
        return "";
    }

    isNegative(value) {
        return value !== undefined && value !== null && Number(value) < 0;
    }

    formatValue(value) {
        if (value === undefined || value === null) {
            return "";
        }
        return Number(value).toFixed(1);
    }

    getBarHeight(col) {
        return `${(col.grandTotal / this.maxColumnTotal) * 100}%`;
    }

    _focusOnToday() {
        if (!this.gridRef.el) {
            return;
        }
        const todayCol = this.visibleColumns.find((c) => c.isToday);
        if (todayCol) {
            const cell = this.gridRef.el.querySelector(
                `[data-col-id="${todayCol.id}"]`
            );
            if (cell) {
                cell.scrollIntoView({block: "nearest", inline: "center"});
            }
        }
    }

    onCellMouseOver(rowId, colId) {
        this.state.hoveredRow = rowId;
        this.state.hoveredCol = colId;
    }

    onCellMouseOut() {
        this.state.hoveredRow = null;
        this.state.hoveredCol = null;
    }

    onCellClick(rowId, colId) {
        if (!this.model.archInfo?.editable) {
            return;
        }
        if (!this.model.archInfo?.measureField) {
            return;
        }
        this.state.editingRow = rowId;
        this.state.editingCol = colId;
    }

    async onCellCommit(value) {
        const rowId = this.state.editingRow;
        const colId = this.state.editingCol;
        this.state.editingRow = null;
        this.state.editingCol = null;
        if (rowId !== null && colId !== null) {
            await this.props.onCellCommit?.(rowId, colId, value);
        }
    }

    onCellNavigate(key, shift) {
        const rowId = this.state.editingRow;
        const colId = this.state.editingCol;
        if (rowId === null || colId === null) {
            return;
        }
        const cols = this.visibleColumns;
        const colIdx = cols.findIndex((c) => c.id === colId);
        let nextIdx = colIdx;
        if (key === "Tab") {
            nextIdx = shift
                ? Math.max(colIdx - 1, 0)
                : Math.min(colIdx + 1, cols.length - 1);
        }
        this.state.editingRow = rowId;
        this.state.editingCol = cols[nextIdx].id;
        this.props.onCellNavigate?.(rowId, cols[nextIdx].id);
    }

    isHovered(rowId, colId) {
        return this.state.hoveredRow === rowId || this.state.hoveredCol === colId;
    }

    isEditing(rowId, colId) {
        return this.state.editingRow === rowId && this.state.editingCol === colId;
    }

    getCell(row, colId) {
        return row.cells?.[colId] || undefined;
    }

    get measureLabel() {
        return (
            this.model.archInfo?.measureField?.string ||
            this.model.fields?.[this.model.measureFieldName]?.field_description ||
            "Total"
        );
    }

    getFieldType() {
        return this.model.fields?.[this.model.measureFieldName]?.type || "float";
    }

    getWidget() {
        return this.model.archInfo?.measureField?.widget || undefined;
    }

    getRowLabelComponent(row) {
        const fieldName = (row.labelParts || row.parts)?.[0]?.name;
        const fieldType = this.model.fields?.[fieldName]?.type;
        return (
            registry.category("grid_view_row_components").get(fieldType, null)
                ?.component || GridRow
        );
    }
}
