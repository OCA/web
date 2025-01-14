/* Copyright 2018 Tecnativa - Jairo Llopis
 * Copyright 2021 ITerra - Sergey Shebanin
 * Copyright 2023 Onestein - Anjeel Haria
 * Copyright 2023 Taras Shabaranskyi
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */

import {Component, onWillStart, useState} from "@odoo/owl";
import {useBus, useService} from "@web/core/utils/hooks";
import {AppMenuItem} from "@web_responsive/components/apps_menu_item/apps_menu_item.esm";
import {AppsMenuSearchBar} from "@web_responsive/components/menu_searchbar/searchbar.esm";
import {NavBar} from "@web/webclient/navbar/navbar";
import {WebClient} from "@web/webclient/webclient";
import {browser} from "@web/core/browser/browser";
import {patch} from "@web/core/utils/patch";
import {router} from "@web/core/browser/router";
import {session} from "@web/session";
import {useHotkey} from "@web/core/hotkeys/hotkey_hook";
import {user} from "@web/core/user";

/* global document */
/* global location */
/* global window */

// Patch WebClient to show AppsMenu instead of default app
patch(WebClient.prototype, {
    setup() {
        super.setup();

        useBus(this.env.bus, "APPS_MENU:STATE_CHANGED", ({detail: state}) => {
            document.body.classList.toggle("o_apps_menu_opened", state);
        });
        onWillStart(async () => {
            const is_redirect_home = await this.orm.searchRead(
                "res.users",
                [["id", "=", user.userId]],
                ["is_redirect_home"]
            );
            user.updateContext({
                is_redirect_to_home: is_redirect_home[0]?.is_redirect_home,
            });
        });
        this.redirect = false;
    },
    _loadDefaultApp() {
        if (user.context.is_redirect_to_home) {
            this.env.bus.trigger("APPS_MENU:STATE_CHANGED", true);
        } else {
            super._loadDefaultApp();
        }
    },
});

export class AppsMenu extends Component {
    setup() {
        super.setup();
        this.state = useState({open: false});
        this.theme = session.apps_menu.theme || "milk";
        this.menuService = useService("menu");
        browser.localStorage.setItem("redirect_menuId", "");

        if (user.context.is_redirect_to_home) {
            const menuId = Number(router.current.menu_id || 0);
            this.state = useState({open: menuId === 0});
        }
        useBus(this.env.bus, "ACTION_MANAGER:UI-UPDATED", () => {
            this.setOpenState(false);
        });
        this._setupKeyNavigation();
    }

    setOpenState(open_state) {
        this.state.open = open_state;
        this.env.bus.trigger("APPS_MENU:STATE_CHANGED", open_state);
    }

    /**
     * Setup navigation among app menus
     */
    _setupKeyNavigation() {
        const repeatable = {
            allowRepeat: true,
        };

        const keyActions = [
            {key: "ArrowRight", action: "next"},
            {key: "ArrowLeft", action: "prev"},
            {key: "ArrowDown", action: "next"},
            {key: "ArrowUp", action: "prev"},
        ];

        keyActions.forEach(({key, action}) => {
            useHotkey(
                key,
                () => {
                    this._onWindowKeydown(action);
                },
                repeatable
            );
        });

        useHotkey("Escape", () => {
            this.env.bus.trigger("ACTION_MANAGER:UI-UPDATED");
        });
    }

    _onWindowKeydown(direction) {
        const focusableInputElements = Array.from(
            document.querySelectorAll(".o-app-menu-item")
        );
        const currentIndex = focusableInputElements.indexOf(document.activeElement);

        if (focusableInputElements.length) {
            const lastIndex = focusableInputElements.length - 1;

            let nextIndex = 0;
            if (direction === "next") {
                nextIndex = currentIndex < lastIndex ? currentIndex + 1 : 0;
            } else if (direction === "prev") {
                nextIndex = currentIndex > 0 ? currentIndex - 1 : lastIndex;
            }

            focusableInputElements[nextIndex].focus();
        }
    }

    onMenuClick() {
        const isRedirect = user.context.is_redirect_to_home;
        const redirectMenuId = browser.localStorage.getItem("redirect_menuId") || "";
        const {href, hash} = location;

        if (isRedirect) {
            const shouldOpenState = !redirectMenuId || !this.state.open;
            this.setOpenState(shouldOpenState);

            const currentMenuId = router.current.menu_id;
            if (currentMenuId && currentMenuId !== redirectMenuId) {
                browser.localStorage.setItem("redirect_menuId", currentMenuId);
            }

            if (href.includes(hash)) {
                window.history.replaceState(null, "", href.replace(hash, ""));
            }
        } else {
            this.setOpenState(!this.state.open);
        }
    }
}

AppsMenu.template = "web_responsive.AppsMenu";
AppsMenu.props = {
    slots: {type: Object, optional: true},
};

Object.assign(NavBar.components, {AppsMenu, AppMenuItem, AppsMenuSearchBar});
