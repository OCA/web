/** @odoo-module **/
/* Copyright 2024 Tecnativa - Carlos Roca
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */
import {ClientActionAdapter} from "@web/legacy/action_adapters";
import Context from "web.Context";
import {mapDoActionOptionAPI} from "@web/legacy/backend_utils";
import {patch} from "@web/core/utils/patch";
import {wrapSuccessOrFail} from "@web/legacy/utils";

patch(ClientActionAdapter.prototype, "web_refresher.ClientActionAdapter", {
    _trigger_up(ev) {
        const payload = ev.data;
        if (ev.name === "refresh_report") {
            this.actionService.restore(payload.controllerID).then(() => {
                if (payload.action.context) {
                    payload.action.context = new Context(payload.action.context).eval();
                }
                const legacyOptions = mapDoActionOptionAPI(payload.options);
                wrapSuccessOrFail(
                    this.actionService.doAction(payload.action, legacyOptions),
                    payload
                );
            });
        } else {
            this._super(...arguments);
        }
    },
});
