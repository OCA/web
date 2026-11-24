/* Copyright 2026 Altixia (https://www.altixia.com)
 * @author: Claude Perrin <claude@altixia.com>
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */
/**
 * "Dark Mode" in the user menu is a choice made by hand; a failed write gives the
 * cookie back. When the user follows the device ("Appearance: Default"), the theme
 * follows it at every load, without reload loops.
 */
import {after, describe, expect, test} from "@odoo/hoot";
import {
    colorSchemeService,
    darkModeSwitchItem,
    followDevice,
} from "@web_dark_mode/js/switch_item.esm";
import {browser} from "@web/core/browser/browser";
import {cookie} from "@web/core/browser/cookie";
import {patchWithCleanup} from "@web/../tests/web_test_helpers";
import {registry} from "@web/core/registry";
import {session} from "@web/session";
import {user} from "@web/core/user";

describe.current.tags("headless");

/** Start the service with fake orm/ui; return what it wrote, blocked, reloaded. */
function startService({failing = false} = {}) {
    const writes = [];
    const blocks = [];
    const reloads = [];
    patchWithCleanup(browser.location, {reload: () => reloads.push(true)});
    const orm = {
        write: async (model, ids, values) => {
            if (failing) {
                throw new Error("refused");
            }
            writes.push([model, ids, values]);
        },
    };
    const ui = {block: () => blocks.push(true)};
    // The service registers the menu item: give the registry back as it was
    const items = registry.category("user_menuitems");
    const previous = items.contains("darkmode") ? items.get("darkmode") : null;
    if (previous) {
        items.remove("darkmode");
    }
    after(() => {
        if (items.contains("darkmode")) {
            items.remove("darkmode");
        }
        if (previous) {
            items.add("darkmode", previous);
        }
    });
    const service = colorSchemeService.start({}, {orm, ui});
    return {service, writes, blocks, reloads};
}

function device(dark) {
    patchWithCleanup(browser, {
        matchMedia: () => ({matches: dark, addEventListener: () => null}),
    });
}

test("web_dark_mode: the menu switch is a choice made by hand", async () => {
    patchWithCleanup(session, {dark_mode_device_dependent: false});
    device(false);
    cookie.set("color_scheme", "light");
    const {service, writes, blocks, reloads} = startService();
    expect(darkModeSwitchItem({services: {color_scheme: service}}).isChecked).toBe(
        false
    );
    await service.switchColorScheme();
    expect(writes).toEqual([
        [
            "res.users",
            [user.userId],
            {dark_mode: true, dark_mode_device_dependent: false},
        ],
    ]);
    expect(cookie.get("color_scheme")).toBe("dark");
    expect(blocks).toEqual([true]);
    expect(reloads).toEqual([true]);
});

test("web_dark_mode: a refused write gives the cookie back, no block, no reload", async () => {
    patchWithCleanup(session, {dark_mode_device_dependent: false});
    device(true);
    cookie.set("color_scheme", "light");
    const {service, blocks, reloads} = startService({failing: true});
    await expect(service.switchColorScheme()).rejects.toThrow("refused");
    expect(cookie.get("color_scheme")).toBe("light");
    expect(blocks).toEqual([]);
    expect(reloads).toEqual([]);
});

test("web_dark_mode: without a cookie, a refused write leaves none", async () => {
    patchWithCleanup(session, {dark_mode_device_dependent: false});
    device(true);
    expect(cookie.get("color_scheme")).toBe(undefined);
    const {service, blocks, reloads} = startService({failing: true});
    // Hoot's fake cookie jar ignores deletions (max-age=0): check the request
    const deleted = [];
    patchWithCleanup(cookie, {delete: (key) => deleted.push(key)});
    await expect(service.switchColorScheme()).rejects.toThrow("refused");
    expect(deleted).toEqual(["color_scheme"]);
    expect(blocks).toEqual([]);
    expect(reloads).toEqual([]);
});

test("web_dark_mode: Default after Dark on a light device turns light, once", () => {
    patchWithCleanup(session, {dark_mode_device_dependent: true});
    device(false);
    cookie.set("color_scheme", "dark");
    const {reloads} = startService();
    expect(cookie.get("color_scheme")).toBe("light");
    expect(reloads).toEqual([true]);
});

test("web_dark_mode: at the next load the theme holds (no reload loop)", () => {
    patchWithCleanup(session, {dark_mode_device_dependent: true});
    device(false);
    cookie.set("color_scheme", "light");
    const {reloads} = startService();
    expect(reloads).toEqual([]);
    expect(cookie.get("color_scheme")).toBe("light");
});

test("web_dark_mode: first load on a dark device, then the next load", () => {
    patchWithCleanup(session, {dark_mode_device_dependent: true});
    device(true);
    const reloads = [];
    patchWithCleanup(browser.location, {reload: () => reloads.push(true)});
    expect(cookie.get("color_scheme")).toBe(undefined);
    // First load: no cookie yet, the device is dark
    followDevice();
    expect(cookie.get("color_scheme")).toBe("dark");
    expect(reloads).toEqual([true]);
    // The reloaded page: the theme now matches, no further reload
    followDevice();
    expect(reloads).toEqual([true]);
});

test("web_dark_mode: the theme follows the device when it switches", () => {
    patchWithCleanup(session, {dark_mode_device_dependent: true});
    const listeners = [];
    const query = {
        matches: false,
        addEventListener: (type, fn) => listeners.push([type, fn]),
    };
    patchWithCleanup(browser, {matchMedia: () => query});
    const reloads = [];
    patchWithCleanup(browser.location, {reload: () => reloads.push(true)});
    cookie.set("color_scheme", "light");
    followDevice();
    expect(reloads).toEqual([]);
    // Evening: the device turns dark
    query.matches = true;
    for (const [type, fn] of listeners) {
        expect(type).toBe("change");
        fn();
    }
    expect(cookie.get("color_scheme")).toBe("dark");
    expect(reloads).toEqual([true]);
});

test("web_dark_mode: a choice made by hand never follows the device", () => {
    patchWithCleanup(session, {dark_mode_device_dependent: false});
    device(false);
    cookie.set("color_scheme", "dark");
    const {reloads} = startService();
    expect(reloads).toEqual([]);
    expect(cookie.get("color_scheme")).toBe("dark");
});
