/** @odoo-module **/
/* Copyright 2025 Miika Nissi (https://miikanissi.com)
/* License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

import {ControlPanel} from "@web/search/control_panel/control_panel";
import {patch} from "@web/core/utils/patch";
import {useService} from "@web/core/utils/hooks";
import {useState} from "@odoo/owl";

patch(ControlPanel.prototype, "web_refresher_auto.ControlPanel", {
    /**
     * Initializes the control panel and sets up the refresher properties.
     * It extends the existing refresher properties with auto-refresh interval time.
     * Defaults to 1 minute if the interval time parameter is not set.
     *
     * @override
     */
    setup() {
        this._super(...arguments);

        this.orm = useService("orm");
        this.refresherProps = useState({
            ...this.refresherProps,
            autoRefresherIntervalTime: 60000,
        });

        this._fetchAutoRefreshInterval();
    },

    async _fetchAutoRefreshInterval() {
        const intervalTimeSeconds = await this.orm.call(
            "ir.config_parameter",
            "get_param",
            ["web_refresher_auto.interval_time_seconds"]
        );
        this.refresherProps.autoRefresherIntervalTime =
            parseInt(intervalTimeSeconds, 10) * 1000 || 60000;
    },
});
