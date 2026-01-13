/** @odoo-module **/
/* Copyright 2024 Tecnativa - Carlos Roca
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

import {ListRenderer} from "@web/views/list/list_renderer";
import {onWillRender} from "@odoo/owl";
import {patch} from "@web/core/utils/patch";
import {serializeDate, serializeDateTime} from "@web/core/l10n/dates";
import {exprToBoolean} from "@web/core/utils/strings";
import {browser} from "@web/core/browser/browser";

patch(ListRenderer.prototype, {
    setup() {
        super.setup(...arguments);
        const parent = this.__owl__.parent.parent;
        const key = this.createViewKey();
        this.keyDuplicateLineColumn = `duplicate_line_column,${key}`;
        this.duplicateLineAllowed =
            parent &&
            parent.props &&
            parent.props.fieldInfo &&
            parent.props.fieldInfo.options &&
            parent.props.fieldInfo.options.allow_clone;
        this.displayDuplicateLine =
            this.duplicateLineAllowed && this.duplicateLineColumn;
        onWillRender(() => {
            this.duplicateLineColumn = exprToBoolean(
                browser.localStorage.getItem(this.keyDuplicateLineColumn),
                false
            );
            this.displayDuplicateLine =
                this.duplicateLineAllowed && this.duplicateLineColumn;
        });
    },
    toggleDuplicateLineColumn() {
        this.duplicateLineColumn = !this.duplicateLineColumn;
        browser.localStorage.setItem(
            this.keyDuplicateLineColumn,
            this.duplicateLineColumn
        );
        this.displayDuplicateLine =
            this.duplicateLineAllowed && this.duplicateLineColumn;
        this.render();
    },
    get hasActionsColumn() {
        return super.hasActionsColumn || Boolean(this.duplicateLineAllowed);
    },
    async onCloneIconClick(record) {
        const toSkip = this.getFieldsToSkip();
        const vals = {};

        for (const [name, value] of Object.entries(record.data)) {
            const fieldDef = this.props.list.fields[name];
            if (toSkip.has(name) || !fieldDef) {
                continue;
            }
            if (fieldDef.type === "many2one" && Array.isArray(value)) {
                vals[name] = value[0];
            } else if (fieldDef.type === "many2many" || fieldDef.type === "one2many") {
                const m2mRecords = Array.isArray(value) ? value : value?.records || [];
                const ids = m2mRecords
                    .map((r) => {
                        if (typeof r.id === "number") return r.id;
                        if (Array.isArray(r._config?.resIds)) return r._config.resIds;
                        return null;
                    })
                    .flat()
                    .filter((id) => typeof id === "number");

                vals[name] = [[6, 0, ids]];
            } else if (fieldDef.type === "datetime" && value) {
                vals[name] = serializeDateTime(value);
            } else if (fieldDef.type === "date" && value) {
                vals[name] = serializeDate(value);
            } else {
                vals[name] = value;
            }
        }
        await record.model.orm.call(
            record._config.resModel,
            "copy",
            [[record._config.resId], vals],
            {context: record._config.context}
        );
        await record.model.load();
    },
    getFieldsToSkip() {
        return new Set([
            "id",
            "display_name",
            "__last_update",
            this.props.list.handleField,
        ]);
    },
});
