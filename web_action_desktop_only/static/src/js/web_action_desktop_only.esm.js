/** @odoo-module **/

// Copyright 2026 Heligrafics
// License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

// Hides applications whose menus are marked as desktop_only when
// the user accesses from a small-screen (mobile) device.

import {registry} from "@web/core/registry";
import {utils} from "@web/core/ui/ui_service";

const menuServiceDescriptor = registry.category("services").get("menu");
const originalStart = menuServiceDescriptor.start;

menuServiceDescriptor.start = async function () {
    const result = await originalStart.apply(this, arguments);

    const originalGetApps = result.getApps.bind(result);
    const getMenu = result.getMenu.bind(result);

    result.getApps = () => {
        const apps = originalGetApps();
        if (!utils.isSmall()) {
            return apps;
        }
        const visibleApps = [];
        for (const app of apps) {
            const visibleChildIds = app.children.filter(
                (childId) => !getMenu(childId).desktopOnly
            );
            if (visibleChildIds.length === 0) continue;
            if (visibleChildIds.length < app.children.length) {
                const mainChild = visibleChildIds
                    .map((id) => getMenu(id))
                    .find((menu) => menu.mainAction);
                if (!mainChild) continue;
                app.children = visibleChildIds;
                app.actionID = mainChild.actionID;
            }
            visibleApps.push(app);
        }
        return visibleApps;
    };

    return result;
};
