odoo.define('web_export_view', function (require) {
    'use strict';

    var core = require('web.core');
    var _t = core._t;
    var _lt = core._lt;
    var QWeb = core.qweb;
    var Sidebar = require('web.Sidebar');
    var formats = require('web.formats');

    Sidebar.include({
        redraw: function () {
            var self = this;
            this._super.apply(this, arguments);
            if (self.getParent().ViewManager.active_view.type == 'list') {
                self.$el.find('.oe_sidebar').append(QWeb.render('AddExportViewMain', {widget: self}));
                self.$el.find('.oe_sidebar_export_view_xls').on('click', self.on_sidebar_export_view_xls);
            }
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
            var rows = view.$el.find('.oe_list_content > tbody > tr');
            var export_rows = [];
            var $title = view.$el.parents().find('.oe_application .oe-view-title').get(0);
            var title = $title.text || $title.textContent || $title.innerHTML || "";
            $.each(rows, function () {
                var $row = $(this);
                // find only rows with data
                if ($row.attr('data-id')) {
                    var export_row = [];
                    if (children && $row.find('th input[type=checkbox]').prop('checked')) {
                        $.each(export_columns_keys, function () {
                            var cell = $row.find('td[data-field="' + this + '"]').get(0);
                            var text = cell.text || cell.textContent || cell.innerHTML || "";
                            if (cell.classList.contains("oe_list_field_float")) {
                                export_row.push(formats.parse_value(text, {'type': "float"}));
                            }
                            else if (cell.classList.contains("oe_list_field_boolean")) {
                                var data_id = $('<div>' + cell.innerHTML + '</div>');
                                if (data_id.find('input').get(0).checked) {
                                    export_row.push(_t("True"));
                                }
                                else {
                                    export_row.push(_t("False"));
                                }
                            }
                            else if (cell.classList.contains("oe_list_field_integer")) {
                                var tmp2 = text;
                                do {
                                    var tmp = tmp2;
                                    tmp2 = tmp.replace(_t.database.parameters.thousands_sep, "");
                                } while (tmp !== tmp2);

                                export_row.push(parseInt(tmp2));
                            }
                            else {
                                export_row.push(text.trim());
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
                    rows: export_rows,
                    title: title
                })},
                complete: $.unblockUI
            });
        }
    });

});
