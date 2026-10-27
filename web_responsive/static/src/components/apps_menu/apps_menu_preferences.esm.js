/* Copyright 2023 Taras Shabaranskyi
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */

import {Component, useProps, xml} from "@odoo/owl";
import {registry} from "@web/core/registry";
import {user} from "@web/core/user";
import {useService} from "@web/core/utils/hooks";

class AppsMenuPreferences extends Component {
    props = useProps({});
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

AppsMenuPreferences.template = xml`
    <div class="o-dropdown dropdown o-dropdown--no-caret">
        <button
            role="button"
            type="button"
            title="App Menu Preferences"
            class="dropdown-toggle o-dropdown--narrow"
            t-on-click="this._onClick">
                <i class="oi fs-4 px-1" data-icon="palette"/>
        </button>
    </div>
`;

registry
    .category("systray")
    .add("AppMenuTheme", {Component: AppsMenuPreferences}, {sequence: 100});
