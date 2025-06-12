/** @odoo-module **/

import {NavBar} from "@web/webclient/navbar/navbar";
import {patch} from "@web/core/utils/patch";

patch(NavBar.prototype, "web_sort_menu.sortmenu", {
    sortApps: (apps) => {
        return apps.sort((a, b) => a.name.localeCompare(b.name));
    },
});
