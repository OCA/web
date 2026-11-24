/* Copyright 2026 Altixia (https://www.altixia.com)
 * @author: Claude Perrin <claude@altixia.com>
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */
/**
 * The user's time zone follows the device: when the interface opens, if the user follows it (`session.tz_auto`) and
 * the device time zone differs from theirs, the server is asked to write it (`res.users.web_timezone_auto_sync`,
 * which decides); the page then uses the new time zone. The service returns its promise: the interface loads its
 * first page afterwards (one call, only when the time zone changes), but never waits more than SYNC_TIMEOUT; a later
 * answer no longer changes the page (the user record is up to date for the next opening). Failures stay silent: new
 * attempt at the next opening.
 */
import {browser} from "@web/core/browser/browser";
import {registry} from "@web/core/registry";
import {session} from "@web/session";
import {user} from "@web/core/user";

/** Device time zone (`Europe/Lisbon`...), or "" if the browser gives none. */
export function deviceTimezone() {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    } catch {
        return "";
    }
}

/** Longest wait for the server at startup, in milliseconds. */
export const SYNC_TIMEOUT = 2000;

/**
 * Return the time zone accepted by the server (written, or already the user's own), or false. The page only takes it
 * if `isCurrent()` is still true when the answer comes.
 */
export async function syncTimezone(
    orm,
    {enabled, deviceTz, userTz},
    isCurrent = () => true
) {
    if (!enabled || !deviceTz || deviceTz === userTz) {
        return false;
    }
    let written = false;
    try {
        written = await orm.silent.call("res.users", "web_timezone_auto_sync", [
            deviceTz,
        ]);
    } catch {
        return false;
    }
    if (written && isCurrent()) {
        user.updateContext({tz: written});
    }
    return written || false;
}

export const timezoneAutoService = {
    dependencies: ["orm"],
    start(env, {orm}) {
        let waiting = true;
        const sync = syncTimezone(
            orm,
            {enabled: session.tz_auto, deviceTz: deviceTimezone(), userTz: user.tz},
            () => waiting
        );
        const timeout = new Promise((resolve) => {
            browser.setTimeout(() => resolve(false), SYNC_TIMEOUT);
        });
        return Promise.race([sync, timeout]).finally(() => {
            waiting = false;
        });
    },
};

registry.category("services").add("web_timezone_auto", timezoneAutoService);
