/* Copyright 2026 ForgeFlow S.L. (https://www.forgeflow.com)
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html). */
import {advanceTime, animationFrame} from "@odoo/hoot-mock";
import {beforeEach, describe, expect, test} from "@odoo/hoot";
import {
    getService,
    mountWithCleanup,
    patchWithCleanup,
} from "@web/../tests/web_test_helpers";
import {LoadingIndicator} from "@web/webclient/loading_indicator/loading_indicator";
import {rpcBus} from "@web/core/network/rpc";
import {session} from "@web/session";
import {config as transitionConfig} from "@web/core/transition";

describe.current.tags("desktop");

const BLOCK_DELAY = 1000;

const payload = (id, settings = {}) => ({
    data: {id, params: {model: "", method: ""}},
    settings,
});

async function mountLoadingIndicator() {
    await mountWithCleanup(LoadingIndicator, {noMainContainer: true});
    const ui = getService("ui");
    ui.bus.addEventListener("BLOCK", () => expect.step("block"));
    ui.bus.addEventListener("UNBLOCK", () => expect.step("unblock"));
    return ui;
}

describe("WebLoadingBlockUI", () => {
    beforeEach(() => {
        patchWithCleanup(transitionConfig, {disabled: true});
        patchWithCleanup(session, {web_loading_block_ui_delay: String(BLOCK_DELAY)});
    });

    test("blocks the UI when a request outlives the configured delay", async () => {
        const ui = await mountLoadingIndicator();
        rpcBus.trigger("RPC:REQUEST", payload(1));
        await advanceTime(BLOCK_DELAY - 1);
        expect.verifySteps([]);
        expect(ui.isBlocked).toBe(false);
        await advanceTime(1);
        await animationFrame();
        expect.verifySteps(["block"]);
        expect(ui.isBlocked).toBe(true);
        rpcBus.trigger("RPC:RESPONSE", payload(1));
        await animationFrame();
        expect.verifySteps(["unblock"]);
        expect(ui.isBlocked).toBe(false);
        expect(".o_loading_indicator").toHaveCount(0);
    });

    test("does not block the UI when the request finishes in time", async () => {
        const ui = await mountLoadingIndicator();
        rpcBus.trigger("RPC:REQUEST", payload(1));
        await advanceTime(BLOCK_DELAY / 2);
        rpcBus.trigger("RPC:RESPONSE", payload(1));
        await advanceTime(BLOCK_DELAY);
        expect.verifySteps([]);
        expect(ui.isBlocked).toBe(false);
    });

    test("stays blocked until the last pending request is answered", async () => {
        const ui = await mountLoadingIndicator();
        rpcBus.trigger("RPC:REQUEST", payload(1));
        rpcBus.trigger("RPC:REQUEST", payload(2));
        await advanceTime(BLOCK_DELAY);
        expect.verifySteps(["block"]);
        rpcBus.trigger("RPC:RESPONSE", payload(1));
        await animationFrame();
        expect.verifySteps([]);
        expect(ui.isBlocked).toBe(true);
        rpcBus.trigger("RPC:RESPONSE", payload(2));
        await animationFrame();
        expect.verifySteps(["unblock"]);
        expect(ui.isBlocked).toBe(false);
    });

    test("ignores silent requests", async () => {
        const ui = await mountLoadingIndicator();
        rpcBus.trigger("RPC:REQUEST", payload(1, {silent: true}));
        await advanceTime(BLOCK_DELAY * 2);
        expect.verifySteps([]);
        expect(ui.isBlocked).toBe(false);
        rpcBus.trigger("RPC:RESPONSE", payload(1, {silent: true}));
        await animationFrame();
        expect.verifySteps([]);
    });

    test("falls back to the default delay on an invalid parameter", async () => {
        patchWithCleanup(session, {web_loading_block_ui_delay: "not-a-number"});
        const ui = await mountLoadingIndicator();
        rpcBus.trigger("RPC:REQUEST", payload(1));
        await advanceTime(BLOCK_DELAY);
        expect.verifySteps([]);
        await advanceTime(3000 - BLOCK_DELAY);
        expect.verifySteps(["block"]);
        expect(ui.isBlocked).toBe(true);
        rpcBus.trigger("RPC:RESPONSE", payload(1));
        await animationFrame();
        expect.verifySteps(["unblock"]);
    });
});
