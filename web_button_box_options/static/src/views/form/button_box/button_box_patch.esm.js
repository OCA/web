/** @odoo-module **/

import {ButtonBox} from "@web/views/form/button_box/button_box";
import {onWillStart} from "@odoo/owl";
import {patch} from "@web/core/utils/patch";
import {useService} from "@web/core/utils/hooks";

patch(
    ButtonBox.prototype,
    "web_button_box_options/static/src/views/form/button_box/button_box_patch.esm.js",
    {
        setup() {
            this._super(...arguments);
            this.orm = useService("orm");
            this.ui = useService("ui");
            // Instance-specific cache for the config parameter
            this.maxButtonsCache = null;
            // Fetch configuration before first render using onWillStart
            onWillStart(async () => {
                await this._fetchMaxButtonsConfig();
            });
            // Override getMaxButtons to use configurable value
            this.getMaxButtons = () => {
                const defaultLimits = [2, 2, 2, 4];
                const defaultMax = 7;
                // Use cached value if available (will be set by onWillStart before first render)
                if (this.maxButtonsCache !== null) {
                    return defaultLimits[this.ui.size] || this.maxButtonsCache;
                }
                // Fallback to default (should rarely happen)
                return defaultLimits[this.ui.size] || defaultMax;
            };
        },

        async _fetchMaxButtonsConfig() {
            const defaultMax = 7;
            try {
                const configLimit = await this.orm.call(
                    "ir.config_parameter",
                    "get_param",
                    ["web_button_box.max_buttons", String(defaultMax)]
                );
                this.maxButtonsCache = parseInt(configLimit, 10) || defaultMax;
            } catch (error) {
                console.error("Failed to fetch button box config:", error);
                this.maxButtonsCache = defaultMax;
            }
        },
    }
);
