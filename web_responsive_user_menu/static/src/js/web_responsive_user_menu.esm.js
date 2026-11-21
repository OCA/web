/* Copyright 2026 Sébastien Couratin, Semper Connect
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */

import {_t} from "@web/core/l10n/translation";
import {registry} from "@web/core/registry";
import {user} from "@web/core/user";

const systrayRegistry = registry.category("systray");
const userMenuRegistry = registry.category("user_menuitems");

// Web_responsive registers the app-menu preferences as a systray item.
systrayRegistry.remove("AppMenuTheme");

userMenuRegistry.add("web_responsive_user_menu.preferences", (env) => ({
    type: "item",
    id: "web_responsive_user_menu.preferences",
    description: _t("App Menu Preferences"),
    callback: async () => {
        const action = await env.services.action.loadAction(
            "web_responsive.res_users_view_form_apps_menu_preferences_action"
        );
        action.res_id = user.userId;
        env.services.action.doAction(action);
    },
    sequence: 55,
}));
