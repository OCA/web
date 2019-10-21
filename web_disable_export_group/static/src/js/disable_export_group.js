/* Copyright 2016 Onestein
   Copyright 2018 Tecnativa - David Vidal
   License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */
odoo.define("web_disable_export_group", function(require) {
"use strict";

    var core = require("web.core");
    var Sidebar = require("web.Sidebar");
    var session = require("web.session");
    var ListController = require("web.ListController");
    var _t = core._t;

    Sidebar.include({
        _addItems: function (sectionCode, items) {
            var _items = items;
            if (!session.is_superuser && sectionCode === 'other' && items.length && !session.group_export_data) {
                _items = _.reject(_items, {label:_t("Export")});
            }
            this._super(sectionCode, _items);
        },
    });

    ListController.include({
        _updateButtons: function (mode) {
            if (this.$buttons) {
                this.$buttons.toggleClass('o-editing', mode === 'edit');
                const state = this.model.get(this.handle, {raw: true});
                if (state.count && session.group_export_data) {
                    this.$('.o_list_export_xlsx').show();
                } else {
                    this.$('.o_list_export_xlsx').hide();
                }
            }
        },
    })
});
