/** @odoo-module **/
/* © 2022 Florian Kantelberg - initOS GmbH
 * Copyright 2026 Altixia (https://www.altixia.com)
 * @author: Claude Perrin <claude@altixia.com>
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

import {_t} from "@web/core/l10n/translation";
import {browser} from "@web/core/browser/browser";
import {cookie} from "@web/core/browser/cookie";
import {registry} from "@web/core/registry";
import {session} from "@web/session";
import {user} from "@web/core/user";

/**
 * Save a choice made by hand. If the write fails, the cookie goes back to what it
 * was, so the theme served never lies.
 */
async function saveScheme(orm, ui, scheme, previousCookie) {
    try {
        await orm.write("res.users", [user.userId], {
            dark_mode: scheme === "dark",
            dark_mode_device_dependent: false,
        });
    } catch (error) {
        if (previousCookie) {
            cookie.set("color_scheme", previousCookie);
        } else {
            cookie.delete("color_scheme");
        }
        throw error;
    }
    ui.block();
    browser.location.reload();
}

export function darkModeSwitchItem(env) {
    return {
        type: "switch",
        id: "color_scheme.switch",
        description: _t("Dark Mode"),
        callback: () => env.services.color_scheme.switchColorScheme(),
        isChecked: cookie.get("color_scheme") === "dark",
        sequence: 40,
    };
}

/**
 * When the user follows the device ("Appearance: Default" in the Preferences), the
 * theme follows it at every page load and as soon as the device switches (e.g. the
 * automatic appearance of macOS, iOS or Android in the evening), not only on the
 * very first visit.
 */
export function followDevice() {
    if (!session.dark_mode_device_dependent || !browser.matchMedia) {
        return;
    }
    const query = browser.matchMedia("(prefers-color-scheme: dark)");
    const follow = () => {
        const scheme = query.matches ? "dark" : "light";
        if (cookie.get("color_scheme") !== scheme) {
            cookie.set("color_scheme", scheme);
            browser.location.reload();
        }
    };
    follow();
    if (query.addEventListener) {
        query.addEventListener("change", follow);
    }
}

export const colorSchemeService = {
    dependencies: ["orm", "ui"],

    start(env, {orm, ui}) {
        registry.category("user_menuitems").add("darkmode", darkModeSwitchItem);
        followDevice();

        return {
            /** "Dark Mode" in the user menu: a choice made by hand. */
            async switchColorScheme() {
                const previous = cookie.get("color_scheme");
                const scheme = previous === "dark" ? "light" : "dark";
                cookie.set("color_scheme", scheme);
                await saveScheme(orm, ui, scheme, previous);
            },
        };
    },
};

registry.category("services").add("color_scheme", colorSchemeService);
