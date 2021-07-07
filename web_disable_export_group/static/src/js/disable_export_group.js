/* Copyright 2016 Onestein
   Copyright 2018 Tecnativa - David Vidal
   Copyright 2021 Tecnativa - Alexandre Díaz
   License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */
odoo.define("web_disable_export_group", function (require) {
    "use strict";

    const core = require("web.core");
    const Sidebar = require("web.Sidebar");
    const session = require("web.session");
    const AbstractController = require("web.AbstractController");
    const _t = core._t;

    Sidebar.include({
        /**
         * @override
         */
        _addItems: function (sectionCode, items) {
            let _items = items;
            if (
                !session.is_superuser &&
                sectionCode === "other" &&
                items.length &&
                !session.group_export_data
            ) {
                _items = _.reject(_items, {label: _t("Export")});
            }
            this._super(sectionCode, _items);
        },
    });

    AbstractController.include({
        /**
         * @override
         */
        is_action_enabled: function (action) {
            if (
                !session.is_superuser &&
                action &&
                action.startsWith("export_") &&
                !session.group_export_data
            ) {
                return false;
            }

            return this._super.apply(this, arguments);
        },
    });
});
