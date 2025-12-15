// © 2022 Florian Kantelberg - initOS GmbH
// © 2025 Liam Noonan - Pyxiris
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

import {_t} from "@web/core/l10n/translation";
import {browser} from "@web/core/browser/browser";
import {cookie} from "@web/core/browser/cookie";
import {registry} from "@web/core/registry";
import {user} from "@web/core/user";

/**
 * @param {import("@web/env").OdooEnv} env
 */
function classicThemeSwitchItem(env) {
    return {
        type: "switch",
        id: "classic_theme.switch",
        description: _t("Classic Theme"),
        callback: () => {
            env.services.classic_theme.switchTheme();
        },
        isChecked: cookie.get("transient_classic_theme_cookie") === "classic",
        sequence: 43,
    };
}

export const classicThemeService = {
    dependencies: ["ui"],

    start(env, {ui}) {
        // Apply theme on load
        if (
            cookie.get("transient_classic_theme_cookie") === "classic" ||
            user.settings.persistent_classic_theme
        ) {
            document.body.classList.add("classic-theme");
        }

        if (!user.settings.persistent_classic_theme) {
            registry
                .category("user_menuitems")
                .add("classic_theme.switch", classicThemeSwitchItem);
        }

        return {
            async switchTheme() {
                const newValue =
                    cookie.get("transient_classic_theme_cookie") === "classic"
                        ? "pure"
                        : "classic";
                cookie.set("transient_classic_theme_cookie", newValue);
                document.body.classList.toggle("classic-theme", newValue === "classic");

                // We do not actually need a reload, but it does get rid of some style glitches
                ui.block();
                browser.location.reload();
            },
        };
    },
};

registry.category("services").add("classic_theme", classicThemeService);
