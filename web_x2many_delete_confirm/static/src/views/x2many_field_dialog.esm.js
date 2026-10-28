/* Copyright 2026 Escodoo
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

import {X2ManyFieldDialog} from "@web/views/fields/relational_utils";
import {patch} from "@web/core/utils/patch";

/**
 * The "Delete" / "Remove" button of the dialog that opens a single x2many
 * line, e.g. the detailed operations of a stock picking.
 */
patch(X2ManyFieldDialog.prototype, {
    async remove() {
        const allowed = await this.env.services.x2many_delete_confirm.check({
            resModel: this.record.resModel,
            parentModel: this.record._parentRecord?.resModel,
        });
        if (!allowed) {
            return;
        }
        return super.remove();
    },
});
