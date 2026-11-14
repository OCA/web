/* Copyright 2026 Altixia (https://www.altixia.com)
 * @author: Claude Perrin <claude@altixia.com>
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */
/**
 * The time zone follows the device: the client only proposes a time zone to the server when needed, updates the page
 * when the server accepts it, keeps quiet on failure, and never blocks the interface.
 */
import {
    SYNC_TIMEOUT,
    deviceTimezone,
    syncTimezone,
    timezoneAutoService,
} from "@web_timezone_auto/timezone_service.esm";
import {after, describe, expect, test} from "@odoo/hoot";
import {advanceTime} from "@odoo/hoot-mock";
import {patchWithCleanup} from "@web/../tests/web_test_helpers";
import {session} from "@web/session";
import {user} from "@web/core/user";

describe.current.tags("headless");

/** Fake ORM: records the calls, returns `answer` (or fails if it is an error). */
function fakeOrm(answer) {
    const calls = [];
    const call = async (model, method, args) => {
        calls.push([model, method, args]);
        if (answer instanceof Error) {
            throw answer;
        }
        return answer;
    };
    return {orm: {silent: {call}}, calls};
}

function watchContext() {
    const updates = [];
    patchWithCleanup(user, {updateContext: (update) => updates.push(update)});
    return updates;
}

test("web_timezone_auto: device in another time zone, the server writes it, the page takes it", async () => {
    const updates = watchContext();
    const {orm, calls} = fakeOrm("Europe/Lisbon");
    const written = await syncTimezone(orm, {
        enabled: true,
        deviceTz: "Europe/Lisbon",
        userTz: "Asia/Bangkok",
    });
    expect(written).toBe("Europe/Lisbon");
    expect(calls).toEqual([["res.users", "web_timezone_auto_sync", ["Europe/Lisbon"]]]);
    expect(updates).toEqual([{tz: "Europe/Lisbon"}]);
});

test("web_timezone_auto: user without a time zone gets the device one", async () => {
    watchContext();
    const {orm, calls} = fakeOrm("Asia/Bangkok");
    await syncTimezone(orm, {enabled: true, deviceTz: "Asia/Bangkok", userTz: false});
    expect(calls).toEqual([["res.users", "web_timezone_auto_sync", ["Asia/Bangkok"]]]);
});

test("web_timezone_auto: nothing to do, no call", async () => {
    const updates = watchContext();
    for (const state of [
        // Already right
        {enabled: true, deviceTz: "Asia/Bangkok", userTz: "Asia/Bangkok"},
        // Fixed time zone
        {enabled: false, deviceTz: "Europe/Lisbon", userTz: "Asia/Bangkok"},
        // Silent browser
        {enabled: true, deviceTz: "", userTz: "Asia/Bangkok"},
    ]) {
        const {orm, calls} = fakeOrm("Europe/Lisbon");
        expect(await syncTimezone(orm, state)).toBe(false);
        expect(calls).toEqual([]);
    }
    expect(updates).toEqual([]);
});

test("web_timezone_auto: the server refuses, the page keeps its time zone", async () => {
    const updates = watchContext();
    const {orm} = fakeOrm(false);
    expect(
        await syncTimezone(orm, {
            enabled: true,
            deviceTz: "Etc/Unknown",
            userTz: "Asia/Bangkok",
        })
    ).toBe(false);
    expect(updates).toEqual([]);
});

test("web_timezone_auto: a failure stays silent", async () => {
    const updates = watchContext();
    const {orm} = fakeOrm(new Error("network"));
    expect(
        await syncTimezone(orm, {
            enabled: true,
            deviceTz: "Europe/Lisbon",
            userTz: "Asia/Bangkok",
        })
    ).toBe(false);
    expect(updates).toEqual([]);
});

/** User in Bangkok, device in Lisbon, automatic setting; returns a way to answer the server call. */
function travelling() {
    const before = user.tz;
    user.updateContext({tz: "Asia/Bangkok"});
    after(() => user.updateContext({tz: before}));
    patchWithCleanup(session, {tz_auto: true});
    patchWithCleanup(Intl, {
        DateTimeFormat: () => ({resolvedOptions: () => ({timeZone: "Europe/Lisbon"})}),
    });
    let answer = null;
    const pending = new Promise((resolve) => (answer = resolve));
    return {orm: {silent: {call: () => pending}}, answer: (tz) => answer(tz)};
}

test("web_timezone_auto: the interface waits for the time zone before its first page", async () => {
    const {orm, answer} = travelling();
    // Start returns its promise: the services startup (and so the first page) waits for it
    const started = timezoneAutoService.start({}, {orm});
    expect(started).toBeInstanceOf(Promise);
    expect(user.tz).toBe("Asia/Bangkok");
    answer("Europe/Lisbon");
    await started;
    expect(user.tz).toBe("Europe/Lisbon");
});

test("web_timezone_auto: silent server, the interface starts anyway and keeps its time zone", async () => {
    const {orm, answer} = travelling();
    let done = false;
    timezoneAutoService.start({}, {orm}).then(() => (done = true));
    await advanceTime(SYNC_TIMEOUT - 10);
    expect(done).toBe(false);
    await advanceTime(20);
    expect(done).toBe(true);
    expect(user.tz).toBe("Asia/Bangkok");
    // Late answer: the page already loaded its data with the old time zone, it keeps it
    answer("Europe/Lisbon");
    await advanceTime(1);
    expect(user.tz).toBe("Asia/Bangkok");
});

test("web_timezone_auto: device time zone read from the browser, empty when none", () => {
    expect(typeof deviceTimezone()).toBe("string");
    patchWithCleanup(Intl, {
        DateTimeFormat: () => {
            throw new Error("missing");
        },
    });
    expect(deviceTimezone()).toBe("");
});
