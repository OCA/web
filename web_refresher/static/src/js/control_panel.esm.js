/** @odoo-module **/
/* Copyright 2022 Tecnativa - Alexandre D. Díaz
 * Copyright 2022 Tecnativa - Carlos Roca
 * Copyright 2023 Taras Shabaranskyi
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

import {ControlPanel} from "@web/search/control_panel/control_panel";
import {Refresher} from "./refresher.esm";
import {patch} from "@web/core/utils/patch";

ControlPanel.components = Object.assign({}, ControlPanel.components, {
    Refresher,
});

patch(ControlPanel.prototype, "web_refresher.ControlPanel", {
    setup() {
        this._super(...arguments);
        const {config, searchModel} = this.env;
        const forbiddenSubType = ["base_settings"];
        if (!forbiddenSubType.includes(config.viewSubType)) {
            this.refresherProps = {
                searchModel: searchModel,
                pagerProps: this.pagerProps,
            };
        }
    },
});
