/** @odoo-module **/
/* Copyright 2022 Tecnativa - Carlos Roca
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html) */

import {PivotRenderer} from "@web/views/pivot/pivot_renderer";
import {patch} from "web.utils";

patch(PivotRenderer.prototype, "web_pivot_computed_measure.PivotRenderer", {
    getFormattedValue(cell) {
        if (Math.abs(cell.value) === Infinity) {
            return "-";
        }
        return this._super(...arguments);
    },
    getFormattedVariation(cell) {
        if (Math.abs(cell.value) === Infinity) {
            return "-";
        }
        return this._super(...arguments);
    },
});
