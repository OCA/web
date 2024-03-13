/** @odoo-module **/

import {patch} from "@web/core/utils/patch";
import {ListController} from "@web/views/list/list_controller";

patch(ListController.prototype, "legacyexport_listcontroller", {
    async onDirectExportData() {
        await this.downloadExport(this.defaultExportList, true, "xlsx");
    },
});
