/** @odoo-module **/

/* Copyright 2023 Kencove (https://kencove.com).
 @author Mohamed Alkobrosli <malkobrosly@kencove.com>
 License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

import {patch} from "@web/core/utils/patch";
import {ImportAction} from "@base_import/import_action/import_action";

patch(ImportAction, {
    template: "web_import_json.ImportAction",
});
