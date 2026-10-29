/* Copyright 2024 Tecnativa - Carlos Roca
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html) */

import {PivotController} from "@web/views/pivot/pivot_controller";
import {patch} from "@web/core/utils/patch";

patch(PivotController.prototype, {
    /**
     * Add computed_measures to context key to avoid loosing info when saving the
     * filter to favorites.
     *
     * @override
     */
    getContext() {
        var res = super.getContext(...arguments);
        res.pivot_computed_measures = this.model._computed_measures;
        return res;
    },
});
