/* Copyright 2024 Tecnativa - Carlos Roca
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

import {ListRenderer} from "@web/views/list/list_renderer";
import {patch} from "@web/core/utils/patch";
import {exprToBoolean} from "@web/core/utils/strings";
import {browser} from "@web/core/browser/browser";
import {x2ManyCommands} from "@web/core/orm_service";

const SCALAR_TYPES = [
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
const MANY2ONE_TYPES = ["many2one", "many2one_reference", "reference"];

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
    /**
     * Snapshot of the record's values, including the readonly computed ones
     * (subtotals...), so the copy is exact. duplicateRecords creates the line
     * running its onchanges, which recompute editable fields (e.g. price_unit
     * from the product) and discard the manual values. We re-apply this
     * snapshot with withoutOnchange so those values are kept.
     *
     * @param {Record} record record to copy the values from
     * @param {StaticList} list list the record belongs to
     * @returns {Object} changes to apply on the copy
     */
    getDuplicateSnapshot(record, list) {
        const snapshot = {};
        for (const [name, value] of Object.entries(record.data)) {
            const field = record.fields[name];
            if (
                !field ||
                name === "display_name" ||
                name === list.handleField ||
                name === list.config.relationField
            ) {
                continue;
            }
            if (SCALAR_TYPES.includes(field.type)) {
                snapshot[name] = value;
            } else if (MANY2ONE_TYPES.includes(field.type)) {
                // Always invisible many2ones are read as a plain id (see
                // getFieldsSpec), so we wrap it and let the model complete the
                // value (display_name...) when applying the change. The rest are
                // copied as a new object, so both records don't share it.
                snapshot[name] =
                    typeof value === "number"
                        ? {id: value}
                        : value && Object.assign({}, value);
            } else if (field.type === "many2many") {
                // SET (and not LINK) so the copy ends up with exactly the same
                // records as the source: this way we also drop the ones the
                // onchange added on its own.
                snapshot[name] = [x2ManyCommands.set([...value.currentIds])];
            }
            // One2many fields can't be set through a snapshot: they are copied
            // sub-record by sub-record in duplicateOne2manyValues().
        }
        return snapshot;
    },
    /**
     * Fetches the values of the sub-records of a one2many that is always
     * invisible in the list: those are read with their ids only (see
     * getFieldsSpec), so their datapoints are empty and copying them as they are
     * would end up creating empty (and usually invalid) records.
     *
     * @param {Record} record source record
     * @param {String} fieldName name of the one2many field
     */
    async loadOne2manyValues(record, fieldName) {
        const invisible = record.activeFields[fieldName].invisible;
        if (invisible !== "True" && invisible !== "1") {
            return;
        }
        const list = record.data[fieldName];
        const lines = list.records.filter((line) => line.resId);
        if (!lines.length) {
            return;
        }
        const values = await list.model._loadRecords(
            {...list.config, resIds: lines.map((line) => line.resId)},
            list.evalContext
        );
        for (const line of lines) {
            const lineValues = values.find((vals) => vals.id === line.resId);
            if (lineValues) {
                line._applyValues(lineValues);
            }
        }
    },
    /**
     * Recreates on the copy the sub-records of every one2many field of the
     * source. They are the only values the snapshot can't carry, as each
     * sub-record has to be created (and filled) on its own. The lines the
     * onchanges may have generated on the copy are dropped first, so both
     * records end up with exactly the same content.
     *
     * @param {Record} record source record
     * @param {Record} newRecord copy of the source record
     */
    async duplicateOne2manyValues(record, newRecord) {
        for (const [name, sourceList] of Object.entries(record.data)) {
            const field = record.fields[name];
            if (!field || field.type !== "one2many" || !(name in newRecord.data)) {
                continue;
            }
            const targetList = newRecord.data[name];
            if (
                !Object.keys(sourceList.activeFields).length ||
                !Object.keys(targetList.activeFields).length
            ) {
                // The sub-records have no fields to copy (the field has no
                // sub-view here).
                continue;
            }
            await this.loadOne2manyValues(record, name);
            if (targetList.records.length) {
                // DELETE for the lines the onchange created on the fly, UNLINK
                // for the existing ones it linked: this way we only discard the
                // pending commands, without touching any stored record.
                await targetList._applyCommands(
                    targetList.records.map((line) =>
                        line.resId
                            ? [x2ManyCommands.UNLINK, line.resId]
                            : [x2ManyCommands.DELETE, line._virtualId]
                    )
                );
            }
            for (const line of sourceList.records) {
                const newLine = await targetList._createNewRecordDatapoint({
                    mode: "readonly",
                });
                const snapshot = this.getDuplicateSnapshot(line, targetList);
                if (Object.keys(snapshot).length) {
                    await newLine._update(snapshot, {
                        withoutOnchange: true,
                        withoutParentUpdate: true,
                    });
                }
                // Nested one2manys are copied the same way, recursively.
                await this.duplicateOne2manyValues(line, newLine);
                // Added at the end, like the core does when duplicating: the
                // record is filled before being part of the list, so the
                // intermediate values are never rendered.
                await targetList._addRecord(newLine, {position: "bottom"});
            }
        }
    },
    async onCloneIconClick(record) {
        const list = this.props.list;
        const left = await list.leaveEditMode();
        if (!left) {
            return;
        }
        const snapshot = this.getDuplicateSnapshot(record, list);
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
            if (newRecord && newRecord.id !== record.id) {
                if (Object.keys(snapshot).length) {
                    await newRecord._update(snapshot, {
                        withoutOnchange: true,
                        withoutParentUpdate: true,
                    });
                }
                await this.duplicateOne2manyValues(record, newRecord);
            }
            await list._onUpdate();
        });
    },
});
