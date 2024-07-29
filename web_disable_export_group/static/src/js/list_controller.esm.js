/** @odoo-module **/
/* Copyright 2018 Tecnativa - David Vidal
   License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */
import ListController from "web.ListController";
import session from "web.session";

ListController.include({
    init() {
        this._super(...arguments);
        this.isExportXlsEnable = false;
    },
    async willStart() {
        const res = await this._super(...arguments);
        this.isExportXlsEnable = await session.user_has_group(
            "web_disable_export_group.group_export_xlsx_data"
        );
        return res;
    },
});
