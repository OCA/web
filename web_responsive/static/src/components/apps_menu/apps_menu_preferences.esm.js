/* Copyright 2023 Taras Shabaranskyi
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */

import {Component} from "@odoo/owl";
import {registry} from "@web/core/registry";
import {useService} from "@web/core/utils/hooks";
import {user} from "@web/core/user";

class AppsMenuPreferences extends Component {
    static props = {};
    setup() {
        this.action = useService("action");
        this.user = user;
    }

    async _onClick() {
        const onClose = () => this.action.doAction("reload_context");
        const action = await this.action.loadAction(
            "web_responsive.res_users_view_form_apps_menu_preferences_action"
        );
        this.action.doAction({...action, res_id: this.user.userId}, {onClose}).then();
    }
}

AppsMenuPreferences.template = "web_responsive.AppsMenuPreferences";

registry
    .category("systray")
    .add("AppMenuTheme", {Component: AppsMenuPreferences}, {sequence: 100});
