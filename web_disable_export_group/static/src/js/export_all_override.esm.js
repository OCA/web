/** @odoo-module **/

import {archParseBoolean} from "@web/views/utils";
import {exportAllItem} from "@web/views/list/export_all/export_all";
import {registry} from "@web/core/registry";

const cogMenuRegistry = registry.category("cogMenu");

// Eliminar el registro anterior
cogMenuRegistry.remove("export-all-menu");

// Clonar el exportAllItem y cambiar la lógica del isDisplayed
const customExportAllItem = {
    ...exportAllItem,
    isDisplayed: async (env) =>
        env.config.viewType === "list" &&
        !env.model.root.selection.length &&
        (await env.model.user.hasGroup(
            "web_disable_export_group.group_export_xlsx_data"
        )) &&
        archParseBoolean(env.config.viewArch.getAttribute("export_xlsx"), true),
};

// Registrar el nuevo item
cogMenuRegistry.add("export-all-menu", customExportAllItem, {sequence: 10});
