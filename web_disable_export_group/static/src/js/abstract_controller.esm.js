/** @odoo-module **/
/* Copyright 2016 Onestein
   Copyright 2018 Tecnativa - David Vidal
   Copyright 2021 Tecnativa - Alexandre Díaz
   Copyright 2022 Tecnativa - Víctor Martínez
   License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */
import AbstractController from "web.AbstractController";
import session from "web.session";

AbstractController.include({
    /**
     * @override
     */
    is_action_enabled: function (action) {
        if (
            !session.is_superuser &&
            action &&
            action === "export_xlsx" &&
            !session.group_xlsx_export_data
        ) {
            return false;
        }

        return this._super.apply(this, arguments);
    },
});
