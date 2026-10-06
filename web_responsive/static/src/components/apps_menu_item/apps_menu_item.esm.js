/* Copyright 2018 Tecnativa - Jairo Llopis
 * Copyright 2021 ITerra - Sergey Shebanin
 * Copyright 2023 Onestein - Anjeel Haria
 * Copyright 2023 Taras Shabaranskyi
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */

import {Component, computed, t, useProps} from "@odoo/owl";
import {getWebIconData} from "@web_responsive/components/apps_menu_tools.esm";

export class AppMenuItem extends Component {
    props = useProps({
        app: t.object(),
        href: t.string(),
        // NavBar passes null when no app is currently selected
        currentApp: t.or([t.object(), t.literal(null)]).optional(),
        onClick: t.function(),
    });
    // Derived from the reactive props (Owl 3: computed replaces onWillUpdateProps)
    webIconData = computed(() => getWebIconData(this.props.app));

    get isActive() {
        const {currentApp} = this.props;
        return currentApp && currentApp.id === this.props.app.id;
    }

    get className() {
        const classItems = ["o-app-menu-item"];
        if (this.isActive) {
            classItems.push("active");
        }
        return classItems.join(" ");
    }

    onClick() {
        if (typeof this.props.onClick === "function") {
            this.props.onClick(this.props.app);
        }
    }
}

Object.assign(AppMenuItem, {
    template: "web_responsive.AppMenuItem",
});
