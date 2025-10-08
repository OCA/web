/** @odoo-module **/

import {patch} from "@web/core/utils/patch";
import {rpc} from "@web/core/network/rpc";
import {View} from "@web/views/view";

/** Hack to get the disable_remaining_days_rule config */
patch(View.prototype, {
    async loadView(props) {
        this.env.config.disable_remaining_days_rule = await rpc(
            "/disable_remaining_days_rule/get_data",
            {}
        );
        await super.loadView(props);
    },
});
