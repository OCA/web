/* Copyright 2018 Tecnativa - Jairo Llopis
 * Copyright 2021 ITerra - Sergey Shebanin
 * Copyright 2023 Onestein - Anjeel Haria
 * Copyright 2023 Taras Shabaranskyi
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */

import {Component, onWillUpdateProps} from "@odoo/owl";
import {getWebIconData} from "@web_responsive/components/apps_menu_tools.esm";

export class AppMenuItem extends Component {
    setup() {
        super.setup();
        this.webIconData = getWebIconData(this.props.app);
        onWillUpdateProps(this.onUpdateProps);
    }

    get isActive() {
        return this.props.currentApp?.id === this.props.app.id;
    }

    get className() {
        return ["o-app-menu-item", this.isActive && "active"].filter(Boolean).join(" ");
    }

    onUpdateProps(nextProps) {
        this.webIconData = getWebIconData(nextProps.app);
    }

    onClick() {
        this.props.onClick?.(this.props.app);
    }
}

AppMenuItem.template = "web_responsive.AppMenuItem";
AppMenuItem.props = {
    app: Object,
    href: String,
    currentApp: {
        type: Object,
        optional: true,
    },
    onClick: Function,
};
