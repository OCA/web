/* Copyright 2025 Tecnativa - Carlos Roca
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */

const checkCalledFromClickEverywhere = function () {
    // Simulate an error to have the stack trace to check if
    // functions are thrown from clickEverywhere
    const error = new Error();
    const stack = error.stack || "";
    // Check that the stack has clickEverywhere function
    return stack.includes("clickEverywhere");
};

// Map stock apps-menu selectors used by clickbot to web_responsive's
// overlay markup (.wr_apps_menu_toggle / .wr_apps_menu_list) so clickEverywhere
// keeps working. Only active while clickEverywhere is on the stack.
const remapClickbotSelector = (selector) => {
    if (selector === ".o-dropdown--menu .o_app") {
        return ".wr_apps_menu_list .o_app";
    }
    if (selector === ".o_navbar_apps_menu .dropdown-toggle") {
        return ".o_navbar_apps_menu .wr_apps_menu_toggle";
    }
    if (selector.includes('.o-dropdown--menu .dropdown-item[data-menu-xmlid="')) {
        return selector.replace(
            ".o-dropdown--menu .dropdown-item",
            ".wr_apps_menu_list .o_app"
        );
    }
    return selector;
};

const originalQuerySelector = document.querySelector;
document.querySelector = function (selector) {
    if (checkCalledFromClickEverywhere()) {
        selector = remapClickbotSelector(selector);
    }
    return originalQuerySelector.call(this, selector);
};

const originalQuerySelectorAll = document.querySelectorAll;
document.querySelectorAll = function (selector) {
    if (checkCalledFromClickEverywhere()) {
        selector = remapClickbotSelector(selector);
    }
    return originalQuerySelectorAll.call(this, selector);
};
