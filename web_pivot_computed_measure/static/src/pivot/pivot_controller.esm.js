/* Copyright 2024 Tecnativa - Carlos Roca
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html) */

import {PivotController} from "@web/views/pivot/pivot_controller";
import {patch} from "@web/core/utils/patch";

patch(PivotController.prototype, {
    /**
     * Add computed measures to the context to keep them when saving the
     * search as a favorite.
     *
     * @override
     */
    getContext() {
        const res = super.getContext(...arguments);
        res.pivot_computed_measures = this.model._computed_measures;
        return res;
    },
});
