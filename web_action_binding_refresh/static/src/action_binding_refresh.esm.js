import {rpcBus} from "@web/core/network/rpc";
import {UPDATE_METHODS} from "@web/core/orm_service";

// The toolbar of a view is built server side from the action bindings and travels
// inside the get_views response, which the web client caches on disk. Core
// invalidates that cache on writes to ir.ui.view and ir.filters only, so binding an
// action to a model leaves the cached entry in place and the action never reaches
// the Actions menu.
//
// Do not send this upstream again. It was proposed as odoo/odoo#286419 and closed in
// the same minute it was answered, as intended behaviour:
// https://github.com/odoo/odoo/pull/286419#issuecomment-5525722682
//
//     "You have to reload the webclient to see the action appear. We were aware of
//      that and believe that it is fine. Creating a server action is an advanced and
//      quite rare flow, so we prefer the current situation than make the code more
//      complex."
//
// Odoo knows about the behaviour, accepts the reload as the workaround, and judged
// the flow too rare to carry the extra code in core. That is a product decision, not
// an oversight, so this module exists to opt into the invalidation instead.
//
// This patches nothing: rpcBus is exported by @web/core/network/rpc and CLEAR-CACHES
// is already consumed there, so the module only publishes the event that core does
// not publish for the action models.
const ACTION_MODELS = [
    "ir.actions.actions",
    "ir.actions.act_window",
    "ir.actions.report",
    "ir.actions.server",
];

// The create_action and unlink_action buttons ("Create/Remove Contextual Action")
// change the bindings through call_button, so they are not in UPDATE_METHODS.
const ACTION_UPDATE_METHODS = [...UPDATE_METHODS, "create_action", "unlink_action"];

rpcBus.addEventListener("RPC:RESPONSE", (ev) => {
    const {model, method} = ev.detail.data.params || {};
    if (ACTION_MODELS.includes(model) && ACTION_UPDATE_METHODS.includes(method)) {
        rpcBus.trigger("CLEAR-CACHES", "get_views");
    }
});
