import {UPDATE_METHODS} from "@web/core/orm_service";
import {rpcBus} from "@web/core/network/rpc";

// Core invalidates the cached get_views on writes to ir.ui.view and ir.filters
// only, so binding an action to a model leaves the cached entry in place.
// Requested in core as odoo/odoo#286419 and declined, so the module opts in.
const ACTION_MODELS = [
    "ir.actions.actions",
    "ir.actions.act_window",
    "ir.actions.report",
    "ir.actions.server",
];

// The Create and Remove Contextual Action buttons change the bindings through
// call_button, so they are not in UPDATE_METHODS.
const ACTION_UPDATE_METHODS = [...UPDATE_METHODS, "create_action", "unlink_action"];

rpcBus.addEventListener("RPC:RESPONSE", (ev) => {
    const {model, method} = ev.detail.data.params || {};
    if (ACTION_MODELS.includes(model) && ACTION_UPDATE_METHODS.includes(method)) {
        rpcBus.trigger("CLEAR-CACHES", "get_views");
    }
});
