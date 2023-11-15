/** @odoo-module **/
/* Copyright 2022 Tecnativa - Alexandre D. Díaz
 * Copyright 2022 Tecnativa - Carlos Roca
 * Copyright 2023 Taras Shabaranskyi
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

import {patch} from "@web/core/utils/patch";
import {ControlPanel} from "@web/search/control_panel/control_panel";
import {Refresher} from "./refresher.esm";

patch(ControlPanel, {
    components: {...ControlPanel.components, Refresher}
})

patch(ControlPanel.prototype, {
    /**
     * @return {{searchModel: Object<*>, pagerProps: Object<*>}|{}}
     */
    get refresherProps() {
        if (this.env.config?.viewType === "form") {
            return {
                searchModel: this.env.searchModel,
                pagerProps: this.pagerProps,
            }
        }
        return {}
    }
})
