/** @odoo-module **/
/* Copyright 2022 Tecnativa - Alexandre D. Díaz
 * Copyright 2022 Tecnativa - Carlos Roca
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */
import LegacyControlPanel from "web.ControlPanel";
import {Refresher} from "./refresher.esm";

// Patch control panel to initialize refresher component
LegacyControlPanel.components = Object.assign({}, LegacyControlPanel.components, {
    Refresher,
});
