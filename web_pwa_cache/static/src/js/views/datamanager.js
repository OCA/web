odoo.define("web_pwa_cache.DataManager", function (require) {
    "use strict";

    var WebClientObj = require("web.web_client");
    var rpc = require("web.rpc");
    var DataManager = require("web.DataManager");

    /**
     * Here we try to force use 'formPWA' instead of 'form' in mobiles devices.
     * Thanks to this we don't need define the new view in the actions.
     */
    DataManager.include({
        load_action: function (action_id, additional_context) {
            var self = this;
            var key = this._gen_key(action_id, additional_context || {});

            if (!this._cache.actions[key]) {
                this._cache.actions[key] = rpc
                    .query({
                        route: "/web/action/load",
                        params: {
                            action_id: action_id,
                            additional_context: additional_context,
                        },
                    })
                    .then(function (action) {
                        self._cache.actions[key] = action.no_cache
                            ? null
                            : self._cache.actions[key];
                        if (WebClientObj.pwa_manager.isPWAStandalone() && action.type === 'ir.actions.act_window') {
                            action.view_mode += ",formPWA";
                            action.view_mode = _.reject(action.view_mode.split(","), function (item) {
                                return item === "form";
                            }).join();
                            var form_found = false;
                            for (var index in action.views) {
                                var view = action.views[index];
                                if (view[1] === "form") {
                                    action.views[index] = [false, "formPWA"];
                                    form_found = true;
                                }
                            }
                            if (!form_found) {
                                action.views.push([false, "formPWA"]);
                            }
                        }
                        return action;
                    }, this._invalidate.bind(this, this._cache.actions, key));
            }

            return this._cache.actions[key].then(function (action) {
                return $.extend(true, {}, action);
            });
        },
    });
});
