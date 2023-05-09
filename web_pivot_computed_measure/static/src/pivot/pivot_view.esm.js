/** @odoo-module **/
/* Copyright 2022 Tecnativa - Carlos Roca
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html) */

import {PivotView} from "@web/views/pivot/pivot_view";
import {patch} from "web.utils";

patch(PivotView.prototype, "web_pivot_computed_measure.PivotView", {
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
