/* Copyright 2024 Tecnativa - Carlos Roca
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

import {ListRenderer} from "@web/views/list/list_renderer";
import {patch} from "@web/core/utils/patch";
import {exprToBoolean} from "@web/core/utils/strings";
import {browser} from "@web/core/browser/browser";

patch(ListRenderer.prototype, {
    setup() {
        super.setup(...arguments);
        const parent = this.__owl__.parent.parent;
        const key = this.createViewKey();
        this.keyDuplicateLineColumn = `duplicate_line_column,${key}`;
        this.duplicateLineAllowed = Boolean(
            parent &&
                parent.props &&
                parent.props.fieldInfo &&
                parent.props.fieldInfo.options &&
                parent.props.fieldInfo.options.allow_clone
        );
        this.duplicateLineColumn = exprToBoolean(
            browser.localStorage.getItem(this.keyDuplicateLineColumn),
            true
        );
    },
    get hasDuplicateLineColumn() {
        return this.duplicateLineAllowed && this.duplicateLineColumn;
    },
    isDuplicableLine(record) {
        return !["line_section", "line_subsection", "line_note"].includes(
            record.data.display_type
        );
    },
    toggleDuplicateLineColumn() {
        this.duplicateLineColumn = !this.duplicateLineColumn;
        browser.localStorage.setItem(
            this.keyDuplicateLineColumn,
            this.duplicateLineColumn
        );
        this.render();
    },
    get nbCols() {
        let nbCols = super.nbCols;
        if (this.hasDuplicateLineColumn) {
            nbCols++;
        }
        return nbCols;
    },
    async onCloneIconClick(record) {
        const list = this.props.list;
        const left = await list.leaveEditMode();
        if (!left) {
            return;
        }
        // Snapshot of the source's scalar values, including the readonly computed
        // ones (subtotals...), so the copy is exact. duplicateRecords creates the
        // line running its onchanges, which recompute editable fields (e.g.
        // price_unit from the product) and discard the manual values. We re-apply
        // this snapshot with withoutOnchange so those values are kept.
        const scalarTypes = [
            "integer",
            "float",
            "monetary",
            "char",
            "text",
            "boolean",
            "selection",
            "date",
            "datetime",
        ];
        const snapshot = {};
        for (const [name, value] of Object.entries(record.data)) {
            const field = record.fields[name];
            if (
                field &&
                name !== "display_name" &&
                name !== list.handleField &&
                scalarTypes.includes(field.type)
            ) {
                snapshot[name] = value;
            }
        }
        // Run everything in a single model transaction and notify only once, at
        // the end, so the intermediate (onchange-recomputed) values are never
        // rendered: the line appears directly with the original values, without
        // the flicker of a second render.
        await list.model.mutex.exec(async () => {
            const sourceIndex = list.records.indexOf(record);
            await list._duplicateRecords([record], {});
            // The duplicate is inserted right after the source line; identify it
            // by position (references aren't stable across the re-wrapping).
            const newRecord = list.records[sourceIndex + 1];
            if (
                newRecord &&
                newRecord.id !== record.id &&
                Object.keys(snapshot).length
            ) {
                await newRecord._update(snapshot, {
                    withoutOnchange: true,
                    withoutParentUpdate: true,
                });
            }
            await list._onUpdate();
        });
    },
});
