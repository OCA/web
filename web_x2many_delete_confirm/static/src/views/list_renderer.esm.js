/* Copyright 2026 Escodoo
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

import {ListRenderer} from "@web/views/list/list_renderer";
import {patch} from "@web/core/utils/patch";

/**
 * Main case: the trash icon (and the Enter key on it) in an x2many inline
 * list. Both funnel through `onDeleteRecord`.
 *
 * `activeActions.onDelete` is only set by `X2ManyField`, so it doubles as the
 * guard that keeps regular list views out: there, deletion goes through the
 * action menu, which the web client already confirms on its own.
 */
patch(ListRenderer.prototype, {
    async onDeleteRecord(record) {
        const list = this.props.list;
        if (
            this.activeActions.onDelete &&
            !(await this.env.services.x2many_delete_confirm.check({
                resModel: list.resModel,
                parentModel: list._parent?.resModel,
            }))
        ) {
            return;
        }
        return super.onDeleteRecord(record);
    },
});
