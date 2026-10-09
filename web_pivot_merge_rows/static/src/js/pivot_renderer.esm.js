// Copyright 2026 OCA
// License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

import {PivotRenderer} from "@web/views/pivot/pivot_renderer";
import {patch} from "@web/core/utils/patch";
import {useState} from "@odoo/owl";

patch(PivotRenderer.prototype, {
    /**
     * Extend setup to initialize reactive merge state.
     * mergeState.merged: { [primaryIndex]: number[] }
     *   Key   = index of the primary row in table.rows
     *   Value = array of absorbed row indices (always contiguous block below primary)
     */
    setup() {
        super.setup();
        this.mergeState = useState({merged: {}});
        // Track the table reference so we can detect model reloads.
        this._lastTable = this.table;
    },

    /**
     * Reset merge state when the model's table changes (groupby, filter, sort, reload).
     * @override
     */
    onWillUpdateProps() {
        super.onWillUpdateProps();
        if (this.table !== this._lastTable) {
            this.mergeState.merged = {};
            this._lastTable = this.table;
        }
    },

    /**
     * Compute the display row list by applying mergeState to table.rows.
     *
     * Rules:
     * - Absorbed rows are skipped entirely.
     * - Primary rows whose indices appear in mergeState.merged are replaced by
     *   synthetic merged row objects.
     * - All other rows pass through unchanged.
     *
     * @returns {Object[]} Display row list (may differ from table.rows length).
     */
    getRows() {
        const rows = this.table.rows;
        const merged = this.mergeState.merged;

        // Build a set of all absorbed indices for O(1) skip check.
        const absorbed = new Set();
        for (const absorbedList of Object.values(merged)) {
            for (const idx of absorbedList) {
                absorbed.add(idx);
            }
        }

        const displayRows = [];
        for (let i = 0; i < rows.length; i++) {
            if (absorbed.has(i)) {
                // This row has been absorbed into a primary above — skip it.
                continue;
            }
            const absorbedIndices = merged[i];
            if (!absorbedIndices) {
                // Plain passthrough row.
                displayRows.push({...rows[i], _originalIndex: i, isMerged: false});
                continue;
            }
            // Build synthetic merged row.
            const absorbedRows = absorbedIndices.map((idx) => rows[idx]);
            displayRows.push(this._buildMergedRow(rows[i], absorbedRows, i));
        }
        return displayRows;
    },

    /**
     * Build a synthetic row object representing the merge of primaryRow with
     * one or more absorbedRows.
     *
     * @param {Object} primaryRow   The primary (topmost) row object from table.rows.
     * @param {Object[]} absorbedRows  Absorbed row objects from table.rows.
     * @param {Number} primaryIndex  Index of primaryRow in table.rows.
     * @returns {Object} Synthetic merged display row.
     */
    _buildMergedRow(primaryRow, absorbedRows, primaryIndex) {
        // Composite title: "A + B [+ C ...]"
        const title = [primaryRow.title, ...absorbedRows.map((r) => r.title)].join(
            " + "
        );

        // Sum subGroupMeasurements per column cell.
        // If any contributing cell has value === undefined, the merged cell is undefined.
        const subGroupMeasurements = primaryRow.subGroupMeasurements.map(
            (cell, colIdx) => {
                let sum = cell.value;
                if (sum === undefined) {
                    return {...cell};
                }
                for (const absorbed of absorbedRows) {
                    const absorbedCell = absorbed.subGroupMeasurements[colIdx];
                    if (
                        absorbedCell === undefined ||
                        absorbedCell.value === undefined
                    ) {
                        return {...cell, value: undefined};
                    }
                    sum += absorbedCell.value;
                }
                return {...cell, value: sum};
            }
        );

        return {
            ...primaryRow,
            title,
            subGroupMeasurements,
            isMerged: true,
            _originalIndex: primaryIndex,
        };
    },

    /**
     * Merge the row at originalIndex with the row immediately below it.
     *
     * The "row immediately below" is determined in original table.rows space:
     * find the next original index after the primary + all its already-absorbed rows.
     *
     * Guard: only merges rows at the same indent level.
     *
     * @param {Number} originalIndex  _originalIndex of the display row to extend.
     */
    onMergeClick(originalIndex) {
        const rows = this.table.rows;
        const merged = this.mergeState.merged;
        const primaryRow = rows[originalIndex];

        // Find the last absorbed index of this primary row (or the primary itself).
        const currentAbsorbed = merged[originalIndex] || [];
        const lastAbsorbedIdx =
            currentAbsorbed.length > 0
                ? currentAbsorbed[currentAbsorbed.length - 1]
                : originalIndex;

        // The candidate is the next index in table.rows after the absorbed block.
        const candidateIdx = lastAbsorbedIdx + 1;
        if (candidateIdx >= rows.length) {
            return; // No row below.
        }

        // Guard: same indent level only.
        if (rows[candidateIdx].indent !== primaryRow.indent) {
            return;
        }

        // Extend absorption.
        this.mergeState.merged = {
            ...merged,
            [originalIndex]: [...currentAbsorbed, candidateIdx],
        };
    },

    /**
     * Unmerge a previously merged row, restoring all absorbed rows.
     *
     * @param {Number} originalIndex  _originalIndex of the merged display row.
     */
    onUnmergeClick(originalIndex) {
        const merged = {...this.mergeState.merged};
        delete merged[originalIndex];
        this.mergeState.merged = merged;
    },

    /**
     * Returns true if a "+" button should be shown for the given display row.
     * Hidden on the last original row and when no same-indent row exists below.
     *
     * @param {Object} displayRow  A row from getRows().
     * @returns {Boolean}
     */
    canMergeRow(displayRow) {
        if (displayRow._originalIndex === undefined) {
            return false; // Header cell, not a body row
        }
        const rows = this.table.rows;
        const merged = this.mergeState.merged;
        const originalIndex = displayRow._originalIndex;
        const currentAbsorbed = merged[originalIndex] || [];
        const lastIdx =
            currentAbsorbed.length > 0
                ? currentAbsorbed[currentAbsorbed.length - 1]
                : originalIndex;
        const nextIdx = lastIdx + 1;
        if (nextIdx >= rows.length) {
            return false;
        }
        return rows[nextIdx].indent === rows[originalIndex].indent;
    },
});
