/* Copyright 2026 volkantasci
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

import {WebClient} from "@web/webclient/webclient";
import {patch} from "@web/core/utils/patch";
import {session} from "@web/session";

patch(WebClient.prototype, {
    setup() {
        super.setup(...arguments);
        document.body.dataset.appTheme = session.apps_menu?.theme || "milk";
    },
});
