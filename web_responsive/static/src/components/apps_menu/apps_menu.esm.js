/** @odoo-module **/
/* Copyright 2018 Tecnativa - Jairo Llopis
 * Copyright 2021 ITerra - Sergey Shebanin
 * Copyright 2021 Onestein - Anjeel Haria
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */

import {NavBar} from "@web/webclient/navbar/navbar";
import {useAutofocus, useBus, useService} from "@web/core/utils/hooks";
import {useHotkey} from "@web/core/hotkeys/hotkey_hook";
import {scrollTo} from "@web/core/utils/scrolling";
import {debounce} from "@web/core/utils/timing";
import {fuzzyLookup} from "@web/core/utils/search";
import {WebClient} from "@web/webclient/webclient";
import {patch} from "web.utils";

const {Component} = owl;
const {useState, useRef} = owl.hooks;
import {unlinkAll} from "@mail/model/model_field_command";

// Patch WebClient to show AppsMenu instead of default app
patch(WebClient.prototype, "web_responsive.DefaultAppsMenu", {
    setup() {
        this._super();
        useBus(this.env.bus, "APPS_MENU:STATE_CHANGED", (payload) => {
            this.el.classList.toggle("o_apps_menu_opened", payload);
        });
    },
});

/**
 * @extends Dropdown
 */
export class AppsMenu extends Component {
    setup() {
        super.setup();
        this.state = useState({open: false});
        useBus(this.env.bus, "ACTION_MANAGER:UI-UPDATED", async () => {
            this.setState(false);
            const messaging = await Component.env.services.messaging.get();
            messaging.dialogManager.update({
                dialogs: unlinkAll(),
            });
        });
        useBus(this.env.bus, "APPS_MENU:CLOSE", () => {
            this.setState(false);
        });
    }
    setState(state) {
        this.state.open = state;
        this.env.bus.trigger("APPS_MENU:STATE_CHANGED", state);
    }
}

/**
 * Reduce menu data to a searchable format understandable by fuzzyLookup
 *
 * `menuService.getMenuAsTree()` returns array in a format similar to this (only
 * relevant data is shown):
 *
 * ```js
 * // This is a menu entry:
 * {
 *     actionID: 12,       // Or `false`
 *     name: "Actions",
 *     childrenTree: {0: {...}, 1: {...}}}, // List of inner menu entries
 *                                          // in the same format or `undefined`
 * }
 * ```
 *
 * This format is very hard to process to search matches, and it would
 * slow down the search algorithm, so we reduce it with this method to be
 * able to later implement a simpler search.
 *
 * @param {Object} memo
 * Reference to current result object, passed on recursive calls.
 *
 * @param {Object} menu
 * A menu entry, as described above.
 *
 * @returns {Object}
 * Reduced object, without entries that have no action, and with a
 * format like this:
 *
 * ```js
 * {
 *  "Discuss": {Menu entry Object},
 *  "Settings": {Menu entry Object},
 *  "Settings/Technical/Actions/Actions": {Menu entry Object},
 *  ...
 * }
 * ```
 */
function findNames(memo, menu) {
    if (menu.actionID) {
        memo[menu.name.trim()] = menu;
    }
    if (menu.childrenTree) {
        const innerMemo = _.reduce(menu.childrenTree, findNames, {});
        for (const innerKey in innerMemo) {
            memo[menu.name.trim() + " / " + innerKey] = innerMemo[innerKey];
        }
    }
    return memo;
}

/**
 * @extends Component
 */
export class AppsMenuSearchBar extends Component {
    setup() {
        super.setup();
        this.state = useState({
            results: [],
            offset: 0,
            hasResults: false,
        });
        useAutofocus({selector: "input"});
        this.searchBarInput = useRef("SearchBarInput");
        this._searchMenus = debounce(this._searchMenus, 100);
        // Store menu data in a format searchable by fuzzy.js
        this._searchableMenus = [];
        this.menuService = useService("menu");
        for (const menu of this.menuService.getApps()) {
            Object.assign(
                this._searchableMenus,
                _.reduce([this.menuService.getMenuAsTree(menu.id)], findNames, {})
            );
        }
        // Set up key navigation
        this._setupKeyNavigation();
    }

    willPatch() {
        // Allow looping on results
        if (this.state.offset < 0) {
            this.state.offset = this.state.results.length + this.state.offset;
        } else if (this.state.offset >= this.state.results.length) {
            this.state.offset -= this.state.results.length;
        }
    }

    patched() {
        // Scroll to selected element on keyboard navigation
        if (this.state.results.length) {
            const listElement = this.el.querySelector(".search-results");
            const activeElement = this.el.querySelector(".highlight");
            if (activeElement) {
                scrollTo(activeElement, listElement);
            }
        }
    }

    /**
     * Search among available menu items, and render that search.
     */
    _searchMenus() {
        const query = this.searchBarInput.el.value;
        this.state.hasResults = query !== "";
        this.state.results = this.state.hasResults
            ? fuzzyLookup(query, _.keys(this._searchableMenus), (k) => k)
            : [];
    }

    /**
     * Get menu object for a given key.
     * @param {String} key Full path to requested menu.
     * @returns {Object} Menu object.
     */
    _menuInfo(key) {
        return this._searchableMenus[key];
    }

    /**
     * Setup navigation among search results
     */
    _setupKeyNavigation() {
        const repeatable = {
            allowRepeat: true,
        };
        useHotkey(
            "ArrowDown",
            () => {
                this.state.offset++;
            },
            repeatable
        );
        useHotkey(
            "ArrowUp",
            () => {
                this.state.offset--;
            },
            repeatable
        );
        useHotkey(
            "Tab",
            () => {
                this.state.offset++;
            },
            repeatable
        );
        useHotkey(
            "Shift+Tab",
            () => {
                this.state.offset--;
            },
            repeatable
        );
        useHotkey("Home", () => {
            this.state.offset = 0;
        });
        useHotkey("End", () => {
            this.state.offset = this.state.results.length - 1;
        });
        useHotkey("Enter", () => {
            if (this.state.results.length) {
                this.el.querySelector(".highlight").click();
            }
        });
    }

    _onKeyDown(ev) {
        if (ev.code === "Escape") {
            ev.stopPropagation();
            ev.preventDefault();
            const query = this.searchBarInput.el.value;
            if (query) {
                this.searchBarInput.el.value = "";
                this.state.results = [];
                this.state.hasResults = false;
            } else {
                this.env.bus.trigger("ACTION_MANAGER:UI-UPDATED");
            }
        }
    }
}
AppsMenu.template = "web_responsive.AppsMenu";
AppsMenuSearchBar.template = "web_responsive.AppsMenuSearchResults";
Object.assign(NavBar.components, {AppsMenu, AppsMenuSearchBar});
