/** @odoo-module **/
// Copyright 2024 Akretion (http://www.akretion.com).
// @author Florian Mounier <florian.mounier@akretion.com>
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

import {patch} from "@web/core/utils/patch";
import {rpcService} from "@web/core/network/rpc_service";

// Here comes the patch, we will add the default fields in the url to the context
// of the onchange calls.
// We could have also patched the actions but this ensure that the context isn't
// kept in the action and is only used for the first action render. Moreover, the
// action_service is even harder to patch.

// The url parameter format is: model_default_field=value

const MODEL_DEFAULT_REGEX = /^(.+)_(default_.+)$/;

patch(rpcService, "start", {
    start(env) {
        const superRpc = this._super(env);

        return function rpc(route, params = {}, settings) {
            const defaults = Object.entries(env.services.router.current.hash).reduce(
                (acc, [key, value]) => {
                    const match = key.match(MODEL_DEFAULT_REGEX);
                    if (match) {
                        acc[match[1]] = acc[match[1]] || {};
                        acc[match[1]][match[2]] = value;
                    }
                    return acc;
                },
                {}
            );

            const model = Object.keys(defaults).find(
                (model_) => `/web/dataset/call_kw/${model_}/onchange` === route
            );
            if (model) {
                // We are on the onchange route of a model with url params defaults
                // We add the default fields to the context of the onchange call
                Object.assign(params.kwargs.context, defaults[model]);

                // To keep the URL parmas we wait for the controller to push its state
                // and we add ours after
                env.bus.addEventListener(
                    "ACTION_MANAGER:UI-UPDATED",
                    () => {
                        env.services.router.pushState(
                            Object.fromEntries(
                                Object.entries(defaults[model]).map(([k, v]) => [
                                    `${model}_${k}`,
                                    v,
                                ])
                            ),
                            {}
                        );
                    },
                    {once: true}
                );
            }

            return superRpc(route, params, settings);
        };
    },
});
