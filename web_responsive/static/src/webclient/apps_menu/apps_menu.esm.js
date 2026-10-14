/* Copyright 2018 Tecnativa - Jairo Llopis
 * Copyright 2021 ITerra - Sergey Shebanin
 * Copyright 2023 Onestein - Anjeel Haria
 * Copyright 2023 Taras Shabaranskyi
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */

import {useRef} from "@odoo/owl";
import {useBus, useService} from "@web/core/utils/hooks";
import {browser} from "@web/core/browser/browser";
import {NavBar} from "@web/webclient/navbar/navbar";
import {useNavigation} from "@web/core/navigation/navigation";
import {patch} from "@web/core/utils/patch";

patch(NavBar.prototype, {
    setup() {
        super.setup();
        this.command = useService("command");
        this.appsMenuOverlay = useRef("appsMenuOverlay");
        this.appsMenuNavigation = useNavigation(this.appsMenuOverlay, {
            shouldFocusFirstItem: true,
            isNavigationAvailable: () =>
                this.state.isAllAppsMenuOpened && this.ui.activeElement === document,
            hotkeys: {
                /** _closeAppMenuSidebar also sets isAllAppsMenuOpened to false */
                escape: () => this._closeAppMenuSidebar(),
                // UseNavigation is 1D; override arrows for the app grid.
                arrowleft: (navigator) => this._navigateAppsMenuGrid(navigator, "left"),
                arrowright: (navigator) =>
                    this._navigateAppsMenuGrid(navigator, "right"),
                arrowup: (navigator) => this._navigateAppsMenuGrid(navigator, "up"),
                arrowdown: (navigator) => this._navigateAppsMenuGrid(navigator, "down"),
            },
        });
        useBus(this.env.bus, "ACTION_MANAGER:UI-UPDATED", () => {
            this.state.isAllAppsMenuOpened = false;
        });
    },

    onAllAppsBtnClick() {
        this.state.isAppMenuSidebarOpened = false;
        this.state.isAllAppsMenuOpened = true;
    },

    onAppsMenuToggle() {
        this.state.isAppMenuSidebarOpened = false;
        this.state.isAllAppsMenuOpened = !this.state.isAllAppsMenuOpened;
    },

    _openAppMenuSidebar() {
        this.state.isAllAppsMenuOpened = false;
        super._openAppMenuSidebar(...arguments);
    },

    /**
     * Keep an item in focus no matter where the user clicks on the overlay.
     * Clicking on the navbar will stil break focus.
     */
    onAppsMenuOverlayPointerDown(ev) {
        if (ev.target.closest(".o-navigable")) {
            return;
        }
        ev.preventDefault();
        this.appsMenuNavigation.items[0]?.setActive();
    },

    onAppsMenuSearchClick() {
        this._openAppsMenuCommandPalette("/");
    },

    /** Store focused app or search icon before opening command pallete */
    _openAppsMenuCommandPalette(searchValue) {
        const overlay = this.appsMenuOverlay.el;
        const restore = overlay?.contains(document.activeElement)
            ? document.activeElement
            : overlay?.querySelector(".search-icon-button") || null;
        restore?.focus();
        this.command.openMainPalette({searchValue}, () => {
            browser.setTimeout(() => {
                if (this.state.isAllAppsMenuOpened && restore?.isConnected) {
                    restore.focus();
                }
            });
        });
    },

    /** Type-to-search; arrows and Escape come from useNavigation. */
    onAppsMenuKeydown(ev) {
        if (ev.ctrlKey || ev.altKey || ev.metaKey) {
            return;
        }
        if (ev.key.length !== 1 || ev.key === " ") {
            return;
        }
        ev.preventDefault();
        ev.stopPropagation();
        this._openAppsMenuCommandPalette(ev.key === "/" ? "/" : `/${ev.key}`);
    },

    /**
     * 2D grid navigation for app tiles.
     * @param {import("@web/core/navigation/navigation").Navigator} navigator
     * @param {"left"|"right"|"up"|"down"} direction
     */
    _navigateAppsMenuGrid(navigator, direction) {
        const {items, activeItemIndex: i} = navigator;
        if (items.length < 2) {
            return;
        }
        const apps = items.slice(1);
        let cols = 1;
        while (cols < apps.length && apps[cols].el.offsetTop === apps[0].el.offsetTop) {
            cols++;
        }
        if (i === 0 && direction !== "up") {
            apps[0].setActive();
            return;
        }
        const delta = {left: -1, right: 1, up: -cols, down: cols}[direction];
        const raw = i + delta;
        const next = Math.min(apps.length, Math.max(0, raw));
        if (next !== i) {
            items[next].setActive();
        }
    },
});
