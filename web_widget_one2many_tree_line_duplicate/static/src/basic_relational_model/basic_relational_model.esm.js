/** @odoo-module **/
/* Copyright 2024 Tecnativa - Carlos Roca
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

import {StaticList} from "@web/views/basic_relational_model";
import {patch} from "@web/core/utils/patch";

patch(StaticList.prototype, "web_widget_one2many_tree_line_duplicate.StaticList", {
    async cloneRecord(recordId, params) {
        const operation = {
            context: [params.context],
            operation: "CLONE",
            position: "bottom",
            id: recordId,
        };
        await this.model.__bm__.save(this.__bm_handle__, {savePoint: true});
        this.model.__bm__.freezeOrder(this.__bm_handle__);
        await this.__syncParent(operation);
        const newRecord = this.records[this.records.length - 1];
        return newRecord;
    },
});
