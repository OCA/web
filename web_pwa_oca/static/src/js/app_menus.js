/* Copyright 2021 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */
odoo.define("web_pwa_oca.AppsMenu", function(require) {
    "use strict";

    const AppsMenu = require("web.AppsMenu");
    require("web_pwa_oca.webclient");
    const WebClientObj = require("web.web_client");

    // This is used to reload last action when "prefetching" is done
    // to ensure display updated records
    AppsMenu.include({
        /**
         * @override
         */
        openFirstApp: function() {
            const is_standalone = WebClientObj.pwa_manager.isPWAStandalone();
            if (is_standalone) {
                const _sup = this._super;
                WebClientObj.menu_dp
                    .add(
                        this._rpc({
                            model: "res.config.settings",
                            method: "get_pwa_home_action",
                        })
                    )
                    .then(action_id => {
                        if (action_id) {
                            return this.do_action(action_id).then(() => {
                                WebClientObj.menu.change_menu_section(
                                    WebClientObj.menu.action_id_to_primary_menu_id(
                                        action_id
                                    )
                                );
                            });
                        }
                        return _sup.apply(this, arguments);
                    });
            } else {
                return this._super(this, arguments);
            }
        },
    });
});
