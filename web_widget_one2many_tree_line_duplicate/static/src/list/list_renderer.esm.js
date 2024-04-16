/** @odoo-module **/
/* Copyright 2024 Tecnativa - Carlos Roca
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

import {ListRenderer} from "@web/views/list/list_renderer";
import {patch} from "@web/core/utils/patch";

patch(ListRenderer.prototype, "web_widget_one2many_tree_line_duplicate.ListRenderer", {
    setup() {
        this._super(...arguments);
        const parent = this.__owl__.parent.parent;
        this.displayDuplicateLine =
            parent &&
            parent.props &&
            parent.props.fieldInfo &&
            parent.props.fieldInfo.options &&
            parent.props.fieldInfo.options.allow_clone;
    },
    get nbCols() {
        var nbCols = this._super(...arguments);
        if (this.displayDuplicateLine) {
            nbCols++;
        }
        return nbCols;
    },
    async onCloneIconClick(record) {
        const editedRecord = this.props.list.editedRecord;
        if (editedRecord && editedRecord !== record) {
            const unselected = await this.props.list.unselectRecord(true);
            if (!unselected) {
                return;
            }
        }
        const context = this.props.list.model.root.context;
        await this.props.list.cloneRecord(record.__bm_handle__, {context});
        this.props.list.model.notify();
    },
});
