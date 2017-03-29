// -*- coding: utf-8 -*-
// © 2012 Agile Business Group
// © 2012 Therp BV
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

odoo.define('web_export_view.Sidebar', function (require) {
"use strict";

var core = require('web.core');
var formats = require('web.formats');
var Sidebar = require('web.Sidebar');

var _t = core._t;

Sidebar.include({
    init: function () {
        var self = this;
        this._super.apply(this, arguments);
        self.sections.push({
            name: 'export_current_view',
            label: _t('Export Current View')
        });
        self.items['export_current_view'] =  [];
        var view = self.getParent();
        if (view.fields_view && view.fields_view.type === "tree") {
            self.web_export_add_items();
        }
    },

    web_export_add_items: function () {
        var self = this;
        self.add_items('export_current_view', [{
            label: 'Excel',
            callback: self.on_sidebar_export_view_xls,
        },]);
    },

    on_sidebar_export_view_xls: function () {
        // Select the first list of the current (form) view
        // or assume the main view is a list view and use that
        var self = this,
            view = this.getParent(),
            children = view.getChildren();
        if (children) {
            children.every(function (child) {
                if (child.field && child.field.type == 'one2many') {
                    view = child.viewmanager.views.list.controller;
                    return false; // break out of the loop
                }
                if (child.field && child.field.type == 'many2many') {
                    view = child.list_view;
                    return false; // break out of the loop
                }
                return true;
            });
        }
        var export_columns_keys = [];
        var export_columns_names = [];
        $.each(view.visible_columns, function () {
            if (this.tag == 'field') {
                // non-fields like `_group` or buttons
                export_columns_keys.push(this.id);
                export_columns_names.push(this.string);
            }
        });
        var rows = view.$el.find('tbody tr[data-id]');
        var export_rows = [];
        $.each(rows, function () {
            var $row = $(this);
            var export_row = [];
            var row_selector = '.o_list_record_selector input[type=checkbox],\
            .oe_list_record_selector input[type=checkbox]';
            var checked = $row.find(row_selector).is(':checked');
            if (children && checked === true) {
                $.each(export_columns_keys, function () {
                    var $cell = $row.find('td[data-field="' + this + '"]');
                    var text = $cell.text();
                    if ($cell.hasClass("oe_list_field_monetary")) {
                        // Remove all but digits, dots and commas
                        text = text.replace(/[^\d\.,]/g, "");
                        export_row.push(
                            formats.parse_value(text, {"type": "monetary"})
                        );
                    } else if ($cell.hasClass("oe_list_field_float")) {
                        export_row.push(
                            formats.parse_value(text, {'type': "float"})
                        );
                    } else if ($cell.hasClass("oe_list_field_boolean")) {
                        export_row.push(
                            $cell.is(':has(input:checked)')
                            ? _t("True") : _t("False")
                        );
                    } else if ($cell.hasClass("oe_list_field_integer")) {
                        var tmp, tmp2 = text;
                        do {
                            tmp = tmp2;
                            tmp2 = tmp.replace(
                                _t.database.parameters.thousands_sep,
                                ""
                            );
                        } while (tmp !== tmp2);

                        export_row.push(parseInt(tmp2));
                    } else {
                        export_row.push(text.trim());
                    }
                });
                export_rows.push(export_row);
            }
        });
        $.blockUI();
        view.session.get_file({
            url: '/web/export/xls_view',
            data: {data: JSON.stringify({
                model: view.model,
                headers: export_columns_names,
                rows: export_rows
            })},
            complete: $.unblockUI
        });
    },

});
});
