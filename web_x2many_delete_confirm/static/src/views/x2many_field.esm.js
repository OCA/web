/* Copyright 2026 Escodoo
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

import {X2ManyField} from "@web/views/fields/x2many/x2many_field";
import {patch} from "@web/core/utils/patch";

/**
 * Kanban flavour of an x2many field. Unlike the list one, its delete callback
 * is built inline in `rendererProps` instead of going through
 * `activeActions.onDelete`, so it has to be wrapped here.
 */
patch(X2ManyField.prototype, {
    get rendererProps() {
        const props = super.rendererProps;
        if (this.props.viewMode !== "kanban" || !props.deleteRecord) {
            return props;
        }
        const deleteRecord = props.deleteRecord;
        props.deleteRecord = async (record) => {
            const allowed = await this.env.services.x2many_delete_confirm.check({
                resModel: this.list.resModel,
                parentModel: this.props.record.resModel,
            });
            return allowed ? deleteRecord(record) : undefined;
        };
        return props;
    },
});
