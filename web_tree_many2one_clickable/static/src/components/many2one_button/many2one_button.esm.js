/** @odoo-module */
/* Copyright 2013 Therp BV (<http://therp.nl>).
 * Copyright 2015 Pedro M. Baeza <pedro.baeza@serviciosbaeza.com>
 * Copyright 2016 Antonio Espinosa <antonio.espinosa@tecnativa.com>
 * Copyright 2017 Sodexis <dev@sodexis.com>
 * Copyright 2018 Camptocamp SA
 * Copyright 2019 Alexandre Díaz <alexandre.diaz@tecnativa.com>
 * Copyright 2024 Versada (https://versada.eu)
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

import {patch} from "@web/core/utils/patch";
import {ListRenderer} from "@web/views/list/list_renderer";
import {useService} from "@web/core/utils/hooks";

patch(ListRenderer.prototype, {
    setup() {
        this.actionService = useService("action");
        super.setup(...arguments);
    },
    async onClickM2oButton(record, column, ev) {
        ev.stopPropagation();
        const field = record.fields[column.name];
        const value = record.data[column.name];
        return this.actionService.doAction({
            type: "ir.actions.act_window",
            res_model: field.relation,
            res_id: value[0],
            views: [[false, "form"]],
            target: "target",
            additionalContext: column.context || {},
        });
    },
});
