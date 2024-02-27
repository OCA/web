/** @odoo-module **/
/* Copyright 2024 Tecnativa - Carlos Roca
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html) */

import {PivotController} from "@web/views/pivot/pivot_controller";
import {patch} from "@web/core/utils/patch";
import {DropdownItemCustomMeasure} from "../dropdown_item_custom_measure/dropdown_item_custom_measure.esm";

patch(PivotController.prototype, "web_pivot_computed_measure.PivotController", {
    /**
     * Add computed_measures to context key to avoid loosing info when saving the
     * filter to favorites.
     *
     * @override
     */
    getContext() {
        var res = this._super(...arguments);
        res.pivot_computed_measures = this.model._computed_measures;
        return res;
    },
});

PivotController.components = {
    ...PivotController.components,
    DropdownItemCustomMeasure,
};
