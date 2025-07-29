/** @odoo-module **/
// (c) 2023 Hunki Enterprises BV (<https://hunki-enterprises.com>)
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html)

import {Domain} from "@web/core/domain";
import {ListController} from "@web/views/list/list_controller";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";

patch(ListController.prototype, {
    getActionMenuItems() {
        const result = this._super();
        if (
            this.archInfo.activeActions.create &&
            this.archInfo.activeActions.duplicate
        ) {
            result.other.push({
                key: "duplicate",
                description: _t("Duplicate"),
                callback: () => this.duplicateRecords(),
            });
        }
        return result;
    },
    async duplicateRecords() {
        const ids = await Promise.all(
            this.model.root.selection.map(async (record) => {
                return await record.model.orm.call(record.resModel, "copy", [
                    record.resId,
                ]);
            })
        );
        this.env.searchModel.createNewFilters([
            {
                description: _t("Duplicated Records"),
                domain: new Domain([["id", "in", ids]]).toString(),
                type: "filter",
            },
        ]);
    },
});
