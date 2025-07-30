/* @odoo-module */
/* Copyright 2024 Tecnativa - David Vidal
 * Copyright 2024 Tecnativa - Carlos Roca
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */
import {Component} from "@odoo/owl";
import {registry} from "@web/core/registry";
import {useService} from "@web/core/utils/hooks";
import {user} from "@web/core/user";

export class InitActionMenu extends Component {
    setup() {
        this.action = useService("action");
        this.showHomeButton = Boolean(user.homeActionId);
    }

    /**
     * Go to user init action when clicking it
     * @private
     */
    onClickInitAction() {
        window.location.href = window.location.origin + "/odoo";
    }
}

InitActionMenu.template = "web_systray_button_init_action.Button";

export const systrayInitAction = {
    Component: InitActionMenu,
};

registry
    .category("systray")
    .add("web_systray_button_init_action.button", systrayInitAction, {sequence: 100});
