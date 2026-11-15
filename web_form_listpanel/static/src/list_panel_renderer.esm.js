/*
    Copyright 2026 Roberto Fichera
    License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
*/
import {ListRenderer} from "@web/views/list/list_renderer";
import {evaluateBooleanExpr} from "@web/core/py_js/py";

const CONSTANTS = new Set(["0", "1", "True", "False"]);

/**
 * The core list renderer, read-only, inside the panel: it marks the form's
 * record, evaluates column_invisible on that record, and leaves the sort
 * order to the panel.
 */
export class ListPanelRenderer extends ListRenderer {
    static props = [...ListRenderer.props, "currentResId?", "formRecord", "onSort"];

    getRowClass(record) {
        const classes = [super.getRowClass(record), "o_listpanel_row"];
        if (record.resId && record.resId === this.props.currentResId) {
            classes.push("o_listpanel_current table-active");
        }
        return classes.join(" ");
    }

    evalColumnInvisible(columnInvisible) {
        // A constant reads nothing of the form record, so editing the form
        // does not re-render the panel's table.
        if (!columnInvisible || CONSTANTS.has(columnInvisible)) {
            return evaluateBooleanExpr(columnInvisible || "False");
        }
        return evaluateBooleanExpr(
            columnInvisible,
            this.props.formRecord.evalContextWithVirtualIds
        );
    }

    onClickSortColumn(column) {
        if (this.preventReorder) {
            this.preventReorder = false;
            return;
        }
        if (this.isSortable(column)) {
            this.props.onSort(column.name);
        }
    }
}
