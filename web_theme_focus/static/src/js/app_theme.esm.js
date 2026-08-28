/* Copyright 2026 volkantasci
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

import {WebClient} from "@web/webclient/webclient";
import {patch} from "@web/core/utils/patch";
import {session} from "@web/session";

// Mirror web_responsive's active app-menu theme onto <body> so CSS can reach
// elements outside .o_grid_apps_menu (e.g. the navbar). Odoo 19's patch util
// does not provide this._super — call super.setup(...arguments).
patch(WebClient.prototype, {
    setup() {
        super.setup(...arguments);
        document.body.dataset.appTheme = session.apps_menu?.theme || "milk";
    },
});
