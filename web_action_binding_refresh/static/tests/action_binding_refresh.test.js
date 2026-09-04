import "@web_action_binding_refresh/action_binding_refresh.esm.js";
import {expect, test} from "@odoo/hoot";
import {rpcBus} from "@web/core/network/rpc";

/**
 * Count the CLEAR-CACHES events published while firing one RPC:RESPONSE.
 *
 * @param {String} model
 * @param {String} method
 * @returns {{calls: number, detail: any}}
 */
function clearCachesFor(model, method) {
    let calls = 0;
    let detail = null;
    const listener = (ev) => {
        calls++;
        detail = ev.detail;
    };
    rpcBus.addEventListener("CLEAR-CACHES", listener);
    try {
        rpcBus.trigger("RPC:RESPONSE", {data: {params: {model, method}}});
    } finally {
        rpcBus.removeEventListener("CLEAR-CACHES", listener);
    }
    return {calls, detail};
}

test("binding a server action invalidates get_views", () => {
    const {calls, detail} = clearCachesFor("ir.actions.server", "create_action");
    expect(calls).toBe(1);
    expect(detail).toBe("get_views");
});

test("unbinding a server action invalidates get_views", () => {
    expect(clearCachesFor("ir.actions.server", "unlink_action").calls).toBe(1);
});

test("saving an action invalidates get_views", () => {
    expect(clearCachesFor("ir.actions.act_window", "web_save").calls).toBe(1);
});

test("reading an action does not invalidate get_views", () => {
    expect(clearCachesFor("ir.actions.server", "web_read").calls).toBe(0);
});

test("another model does not invalidate get_views", () => {
    expect(clearCachesFor("res.partner", "web_save").calls).toBe(0);
});
