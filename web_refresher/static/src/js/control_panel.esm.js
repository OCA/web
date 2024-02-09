/** @odoo-module **/
/* Copyright 2024 Tecnativa - Carlos Roca
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */
import {ControlPanel} from "@web/search/control_panel/control_panel";
import {Refresher} from "./refresher.esm";

ControlPanel.components = Object.assign({}, ControlPanel.components, {
    Refresher,
});
