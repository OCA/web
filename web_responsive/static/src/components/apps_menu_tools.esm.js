/* Copyright 2018 Tecnativa - Jairo Llopis
 * Copyright 2021 ITerra - Sergey Shebanin
 * Copyright 2023 Onestein - Anjeel Haria
 * Copyright 2023 Taras Shabaranskyi
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */

export function getWebIconData(menu) {
    // Delegate to Odoo's built-in webIconData if available
    // This properly handles base64 images, file paths, and all icon formats
    if (menu.webIconData) {
        return menu.webIconData;
    }
    // Fallback to default icon if no icon data is provided
    return "/web_responsive/static/img/default_icon_app.png";
}

/**
 * Ensures menu has webIconData property set
 * @param {Object} menu - Menu object to update (typically a shallow copy)
 */
export function updateMenuWebIconData(menu) {
    // GetWebIconData returns menu.webIconData if it exists (from Odoo),
    // otherwise returns the default icon. This ensures the menu copy
    // always has a valid icon reference.
    menu.webIconData = getWebIconData(menu);
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
