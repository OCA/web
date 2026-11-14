/* Copyright 2018 Tecnativa - David Vidal
   Copyright 2025 Tecnativa - Carlos Lopez
   License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
*/

import {exportAllItem} from "@web/views/list/export_all/export_all";
import {exprToBoolean} from "@web/core/utils/strings";
import {registry} from "@web/core/registry";
import {user} from "@web/core/user";

const cogMenuRegistry = registry.category("cogMenu");

const customExportAllItem = {
    ...exportAllItem,
    isDisplayed: async (env) =>
        ["kanban", "list"].includes(env.config.viewType) &&
        !env.model.root.selection.length &&
        (await user.hasGroup("web_disable_export_group.group_export_xlsx_data")) &&
        exprToBoolean(env.config.viewArch.getAttribute("export_xlsx"), true),
};
// Add the customExportAllItem to the cog menu registry
// using the same key as the original to replace it, and pass the force option to do so
cogMenuRegistry.add("export-all-menu", customExportAllItem, {force: true});
