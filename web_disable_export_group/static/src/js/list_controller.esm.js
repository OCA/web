/** @odoo-module **/
/* Copyright 2018 Tecnativa - David Vidal
   License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */
import {ListController} from "@web/views/list/list_controller";
import {onWillStart} from "@odoo/owl";
import {patch} from "@web/core/utils/patch";

patch(ListController.prototype, "disable_export_group", {
    setup() {
        this._super(...arguments);
        onWillStart(async () => {
            this.isExportEnable = await this.userService.hasGroup(
                "base.group_allow_export"
            );
            this.isExportXlsEnable = await this.userService.hasGroup(
                "web_disable_export_group.group_export_xlsx_data"
            );
        });
    },
});
