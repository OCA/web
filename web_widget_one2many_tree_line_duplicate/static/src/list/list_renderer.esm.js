/** @odoo-module **/
/* Copyright 2024 Tecnativa - Carlos Roca
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

import {ListRenderer} from "@web/views/list/list_renderer";
import {patch} from "@web/core/utils/patch";
import {serializeDate, serializeDateTime} from "@web/core/l10n/dates";

patch(ListRenderer.prototype, {
    setup() {
        super.setup(...arguments);
        const parent = this.__owl__.parent.parent;
        this.displayDuplicateLine =
            parent &&
            parent.props &&
            parent.props.fieldInfo &&
            parent.props.fieldInfo.options &&
            parent.props.fieldInfo.options.allow_clone;
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
