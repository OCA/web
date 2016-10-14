odoo.define('web_export_view.web_export_view', function (require) {
"use strict";

    var core = require('web.core');
    var Sidebar = require('web.Sidebar');
    var QWeb = core.qweb;

    var _t = core._t;

    Sidebar.include({

        redraw: function () {
            var self = this;
            this._super.apply(this, arguments);
            if (self.getParent().ViewManager.active_view.type == 'list') {
                self.$el.find('.o_dropdown').last().append(QWeb.render('AddExportViewMain', {widget: self}));
                self.$el.find('.export_treeview_xls').on('click', self.on_sidebar_export_treeview_xls);
            }
        },

        on_sidebar_export_treeview_xls: function () {
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
                if (this.tag == 'field' && (this.widget === undefined || this.widget != 'handle')) {
                    // non-fields like `_group` or buttons
                    export_columns_keys.push(this.id);
                    export_columns_names.push(this.string);
                }
            });
            var rows = view.$el.find('.o_list_view > tbody > tr');
            var export_rows = [];
            $.each(rows, function () {
                var $row = $(this);
                // find only rows with data
                if ($row.attr('data-id')) {
                    var export_row = [];
                    var checked = $row.find('.o_list_record_selector input[type=checkbox]').is(':checked');
                    if (children && checked === true) {
                        $.each(export_columns_keys, function () {
                            var $cell = $row.find('td[data-field="' + this + '"]')
                            var $cellcheckbox = $cell.find('.o_checkbox input[type=checkbox]');
                            if ($cellcheckbox.length) {
                                if ($cellcheckbox.is(':checked')) {
                                    export_row.push(_t("True"));
                                }
                                else {
                                    export_row.push(_t("False"));
                                }
                            }
                            else {
                                var cell = $cell.get(0);
                                var text = cell.text || cell.textContent || cell.innerHTML || "";

                                if (cell.classList.contains("o_list_number")) {
                                    var tmp2 = text;
                                    do {
                                        var tmp = tmp2;
                                        tmp2 = tmp.replace(core._t.database.parameters.thousands_sep, "");
                                    } while (tmp !== tmp2);

                                    export_row.push(parseFloat(tmp2));
                                }
                                else {
                                    export_row.push(text.trim());
                                }
                            }
                        });
                        export_rows.push(export_row);
                    }
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
        }

    });
});