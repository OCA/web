/* Copyright 2018 Tecnativa - Jairo Llopis
 * Copyright 2021 ITerra - Sergey Shebanin
 * Copyright 2023 Onestein - Anjeel Haria
 * Copyright 2023 Taras Shabaranskyi
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */

import {reactive} from "@odoo/owl";
import {user} from "@web/core/user";

/**
 * Per-user apps menu ordering, persisted on `res.users.settings`.
 * `ids` is `null` until loaded lazily on first access, because
 * `user.settings` is not populated yet when this module is evaluated.
 */
export const appsMenuOrder = reactive({ids: null});

function _loadAppsMenuOrder() {
    if (appsMenuOrder.ids === null) {
        const saved = user.settings.apps_menu_order;
        appsMenuOrder.ids = Array.isArray(saved)
            ? saved.map(Number).filter(Number.isFinite)
            : [];
    }
}

/**
 * Sort apps following the user's custom order. Apps not present in the
 * saved order (e.g. newly installed) are appended in their default order.
 *
 * @param {Object[]} apps
 * @returns {Object[]}
 */
export function sortApps(apps) {
    _loadAppsMenuOrder();
    const byId = new Map(apps.map((app) => [app.id, app]));
    const seen = new Set();
    const sorted = [];
    for (const id of appsMenuOrder.ids) {
        if (byId.has(id) && !seen.has(id)) {
            seen.add(id);
            sorted.push(byId.get(id));
        }
    }
    return sorted.concat(apps.filter((app) => !seen.has(app.id)));
}

/**
 * Persist the given apps ordering for the current user.
 *
 * @param {Number[]} ids root menu ids
 */
export function saveAppsMenuOrder(ids) {
    appsMenuOrder.ids = [...ids];
    return user.setUserSettings("apps_menu_order", appsMenuOrder.ids);
}

export function getWebIconData(menu) {
    const result = "/web_responsive/static/img/default_icon_app.png";
    const webIcon = menu.webIcon;
    if (webIcon && webIcon.split(",").length === 2) {
        const path = webIcon.replace(",", "/");
        return path.startsWith("/") ? path : "/" + path;
    }
    const iconData = menu.webIconData;
    if (!menu.webIcon) {
        return result;
    }
    const prefix = iconData.startsWith("P")
        ? "data:image/svg+xml;base64,"
        : "data:image/png;base64,";
    if (iconData.startsWith("data:image")) {
        return iconData;
    }
    return prefix + iconData.replace(/\s/g, "");
}

/**
 * @param {Object} menu
 */
export function updateMenuWebIconData(menu) {
    menu.webIconData = menu.webIconData ? getWebIconData(menu) : "";
}

export function updateMenuDisplayName(menu) {
    menu.displayName = menu.name.trim();
}

/**
 * @param {Object} menu
 * @returns {Boolean}
 */
export function isRootMenu(menu) {
    return menu.actionID && menu.appID === menu.id;
}

/**
 * @param {Object[]} memo
 * @param {Object|null} parentMenu
 * @param {Object} menu
 * @returns {Object[]}
 */
export function collectSubMenuItems(memo, parentMenu, menu) {
    const menuCopy = Object.assign({}, menu);
    updateMenuDisplayName(menuCopy);
    if (parentMenu) {
        menuCopy.displayName = `${parentMenu.displayName} / ${menuCopy.displayName}`;
    }
    if (menuCopy.actionID && !isRootMenu(menuCopy)) {
        memo.push(menuCopy);
    }
    for (const child of menuCopy.childrenTree || []) {
        collectSubMenuItems(memo, menuCopy, child);
    }
    return memo;
}

/**
 * @param {Object[]} memo
 * @param {Object} menu
 * @returns {Object}
 */
export function collectRootMenuItems(memo, menu) {
    if (isRootMenu(menu)) {
        const menuCopy = Object.assign({}, menu);
        updateMenuWebIconData(menuCopy);
        updateMenuDisplayName(menuCopy);
        memo.push(menuCopy);
    }
    return memo;
}
