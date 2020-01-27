// Copyright 2020 Akretion France (http://www.akretion.com/)
// @author: Alexis de Lattre <alexis.delattre@akretion.com>
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

odoo.define('web_widget_email_listview.email_widget_tree', function (require) {
    "use strict";

    var core = require('web.core');
    var treewidgets = require('web.ListView');

    var ColumnEmail = treewidgets.Column.extend({
        _format: function(row_data, options) {
            var email = row_data[this.id].value;
            if (email) {
                return _.template("<a href='mailto:<%-href%>'><%-text%></a>")({
                    href: email,
                    text: email
                });
            }
            return this._super(row_data, options);
        }
    });

    if (!core.list_widget_registry.get('email')) {
        core.list_widget_registry.add('field.email', ColumnEmail);
    }

});
