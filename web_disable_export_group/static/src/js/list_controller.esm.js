/** @odoo-module **/
/* Copyright 2018 Tecnativa - David Vidal
   License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */
import {archParseBoolean} from "@web/views/utils";
import {exportAllItem} from "@web/views/list/export_all/export_all";
import {patch} from "@web/core/utils/patch";

patch(exportAllItem, {
    async isDisplayed(env) {
        const ExportEnable = super.isDisplayed(...arguments);
        const ExportXlsEnable =
            env.config.viewType === "list" &&
            !env.model.root.selection.length &&
            (await env.model.user.hasGroup(
                "web_disable_export_group.group_export_xlsx_data"
            )) &&
            archParseBoolean(env.config.viewArch.getAttribute("export_xlsx"), true);
        if (ExportXlsEnable) {
            return ExportXlsEnable;
        }
        return ExportEnable;
    },
});
