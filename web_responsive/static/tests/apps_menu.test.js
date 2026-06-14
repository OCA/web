/* Copyright 2023 Taras Shabaranskyi
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */

import {SIZES, defineMailModels, patchUiSize} from "@mail/../tests/mail_test_helpers";
import {beforeEach, expect, test} from "@odoo/hoot";
import {
    contains,
    defineActions,
    defineMenus,
    getMockEnv,
    getService,
    mockService,
    mountWithCleanup,
    patchWithCleanup,
    useTestClientAction,
} from "@web/../tests/web_test_helpers";
import {press, queryAll, queryFirst} from "@odoo/hoot-dom";
import {NavBar} from "@web/webclient/navbar/navbar";
import {animationFrame} from "@odoo/hoot-mock";
import {config as transitionConfig} from "@web/core/transition";

defineMailModels();

beforeEach(() => {
    const testAction = useTestClientAction();
    defineActions([
        {...testAction, id: 1001, params: {description: "App0"}},
        {...testAction, id: 1002, params: {description: "App1"}},
    ]);
    defineMenus([
        {id: 1, name: "App0", xmlid: "menu_1", actionID: 1001},
        {id: 2, name: "App1", xmlid: "menu_2", actionID: 1002},
    ]);
    patchWithCleanup(transitionConfig, {disabled: true});
});

test.tags("desktop");
test("replaces stock dropdown with overlay toggle", async () => {
    await mountWithCleanup(NavBar);
    expect(".o_navbar_apps_menu .wr_apps_menu_toggle").toHaveCount(1, {
        message: "1 apps menu toggle present",
    });
    expect(".o_navbar_apps_menu button").toHaveCount(0, {
        message: "stock apps dropdown is removed",
    });
    expect(".o_navbar_apps_menu .wr_apps_menu_toggle").toHaveAttribute("href", "/odoo");
    expect(".o_navbar_apps_menu .wr_apps_menu_toggle").toHaveAttribute(
        "aria-expanded",
        "false"
    );
    expect(".o_navbar_apps_menu .wr_apps_menu_toggle").toHaveAttribute(
        "data-hotkey",
        "h"
    );
});

test.tags("desktop");
test("can be opened and closed", async () => {
    await mountWithCleanup(NavBar);
    await contains(".o_navbar_apps_menu .wr_apps_menu_toggle").click();
    expect(".wr_apps_menu_container .wr_apps_menu_list").toHaveCount(1);
    expect(".o_navbar_apps_menu .wr_apps_menu_toggle").toHaveAttribute(
        "aria-expanded",
        "true"
    );
    await contains(".o_navbar_apps_menu .wr_apps_menu_toggle").click();
    expect(".wr_apps_menu_container .wr_apps_menu_list").toHaveCount(0);
    expect(".o_navbar_apps_menu .wr_apps_menu_toggle").toHaveAttribute(
        "aria-expanded",
        "false"
    );
});

test.tags("desktop");
test("marks the current app as active", async () => {
    await mountWithCleanup(NavBar);
    await contains(".o_navbar_apps_menu .wr_apps_menu_toggle").click();
    getService("menu").setCurrentMenu(1);
    await animationFrame();
    expect('.wr_apps_menu_item.active[data-menu-xmlid="menu_1"]').toHaveCount(1);
    getService("menu").setCurrentMenu(2);
    await animationFrame();
    expect('.wr_apps_menu_item.active[data-menu-xmlid="menu_2"]').toHaveCount(1);
});

test.tags("desktop");
test("search icon opens the command palette", async () => {
    await mountWithCleanup(NavBar);
    await contains(".o_navbar_apps_menu .wr_apps_menu_toggle").click();
    expect(".wr_apps_menu_container .search-icon-button").toHaveCount(1);
    await contains(".wr_apps_menu_container .search-icon-button").click();
    expect(".o_command_palette").toHaveCount(1);
});

test.tags("desktop");
test("typing in the overlay opens the command palette", async () => {
    await mountWithCleanup(NavBar);
    await contains(".o_navbar_apps_menu .wr_apps_menu_toggle").click();
    await animationFrame();
    await press("a");
    await animationFrame();
    expect(".o_command_palette").toHaveCount(1);
});

test.tags("desktop");
test("typing still opens the palette after clicking empty overlay space", async () => {
    await mountWithCleanup(NavBar);
    await contains(".o_navbar_apps_menu .wr_apps_menu_toggle").click();
    await animationFrame();
    await contains(".wr_apps_menu_container").click();
    await press("a");
    await animationFrame();
    expect(".o_command_palette").toHaveCount(1);
});

test.tags("desktop");
test("Escape closes the overlay", async () => {
    await mountWithCleanup(NavBar);
    await contains(".o_navbar_apps_menu .wr_apps_menu_toggle").click();
    expect(".wr_apps_menu_container").toHaveCount(1);
    await press("Escape");
    await animationFrame();
    expect(".wr_apps_menu_container").toHaveCount(0);
    expect(".o_navbar_apps_menu .wr_apps_menu_toggle").toHaveAttribute(
        "aria-expanded",
        "false"
    );
});

test.tags("desktop");
test("arrow keys move focus across the app grid", async () => {
    await mountWithCleanup(NavBar);
    await contains(".o_navbar_apps_menu .wr_apps_menu_toggle").click();
    await animationFrame();
    const searchBtn = queryFirst(".wr_apps_menu_container .search-icon-button");
    const firstApp = queryFirst(
        '.wr_apps_menu_list .wr_apps_menu_item[data-menu-xmlid="menu_1"]'
    );
    const secondApp = queryFirst(
        '.wr_apps_menu_list .wr_apps_menu_item[data-menu-xmlid="menu_2"]'
    );
    expect(searchBtn).toBeFocused();
    await press("ArrowDown");
    expect(firstApp).toBeFocused();
    await press("ArrowRight");
    expect(secondApp).toBeFocused();
    await press("ArrowRight");
    expect(secondApp).toBeFocused(); // No wrap at end of row
    await press("ArrowLeft");
    expect(firstApp).toBeFocused();
    await press("ArrowUp");
    expect(searchBtn).toBeFocused();
    await press("ArrowUp");
    expect(searchBtn).toBeFocused(); // No wrap from search
});

test.tags("desktop");
test("Escape on the command palette keeps the overlay and restores focus", async () => {
    await mountWithCleanup(NavBar);
    await contains(".o_navbar_apps_menu .wr_apps_menu_toggle").click();
    await animationFrame();
    expect(".wr_apps_menu_container .search-icon-button").toBeFocused();
    await contains(".wr_apps_menu_container .search-icon-button").click();
    expect(".o_command_palette").toHaveCount(1);
    await press("Escape");
    await animationFrame();
    expect(".o_command_palette").toHaveCount(0);
    expect(".wr_apps_menu_container").toHaveCount(1);
    expect(".wr_apps_menu_container .search-icon-button").toBeFocused();
});

test.tags("desktop");
test("selecting an app closes the overlay", async () => {
    await mountWithCleanup(NavBar);
    await contains(".o_navbar_apps_menu .wr_apps_menu_toggle").click();
    await contains(
        '.wr_apps_menu_list .wr_apps_menu_item[data-menu-xmlid="menu_1"]'
    ).click();
    await animationFrame();
    expect(".wr_apps_menu_container").toHaveCount(0);
});

test.tags("desktop");
test("UI-UPDATED closes the overlay", async () => {
    await mountWithCleanup(NavBar);
    await contains(".o_navbar_apps_menu .wr_apps_menu_toggle").click();
    expect(".wr_apps_menu_container").toHaveCount(1);
    getMockEnv().bus.trigger("ACTION_MANAGER:UI-UPDATED");
    await animationFrame();
    expect(".wr_apps_menu_container").toHaveCount(0);
});

test.tags("desktop");
test("hides the apps menu when running as a scoped app", async () => {
    mockService("pwa", {isScopedApp: true});
    await mountWithCleanup(NavBar);
    expect(".wr_apps_menu_toggle").toHaveCount(0);
    expect(".wr_apps_menu_container").toHaveCount(0);
});

test.tags("mobile");
test("shows overlay toggle alongside hamburger on small screens", async () => {
    await patchUiSize({size: SIZES.SM});
    await mountWithCleanup(NavBar);
    expect(".wr_apps_menu_toggle").toHaveCount(1);
    expect(".o_menu_toggle").toHaveCount(1);
    expect(".o_menu_toggle").toHaveAttribute("href", "#");
    expect(".o_menu_toggle").not.toHaveAttribute("accesskey");
});

test.tags("mobile");
test("All Apps from sidebar opens the overlay and closes the sidebar", async () => {
    await patchUiSize({size: SIZES.SM});
    await mountWithCleanup(NavBar);
    getService("menu").setCurrentMenu(1);
    await animationFrame();
    await contains(".o_menu_toggle", {root: document.body}).click();
    expect(queryAll(".o_app_menu_sidebar", {root: document.body})).toHaveCount(1);
    await contains(".o_sidebar_topbar a.btn-primary", {root: document.body}).click();
    await animationFrame();
    expect(".wr_apps_menu_container").toHaveCount(1);
    expect(queryAll(".o_app_menu_sidebar", {root: document.body})).toHaveCount(0);
});

test.tags("mobile");
test("opening the hamburger closes an open apps overlay", async () => {
    await patchUiSize({size: SIZES.SM});
    await mountWithCleanup(NavBar);
    await contains(".wr_apps_menu_toggle").click();
    expect(".wr_apps_menu_container").toHaveCount(1);
    await contains(".o_menu_toggle", {root: document.body}).click();
    await animationFrame();
    expect(".wr_apps_menu_container").toHaveCount(0);
    expect(queryAll(".o_app_menu_sidebar", {root: document.body})).toHaveCount(1);
});
