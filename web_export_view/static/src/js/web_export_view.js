//# -*- coding: utf-8 -*-
//# © 2012 Agile Business Group
//# © 2012 Therp BV 
//# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

openerp.web_export_view = function (instance) {

    var _t = instance.web._t, QWeb = instance.web.qweb;

    instance.web.Sidebar.include({
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
            export_columns_keys = [];
            export_columns_names = [];
            $.each(view.visible_columns, function () {
                if (this.tag == 'field') {
                    // non-fields like `_group` or buttons
                    export_columns_keys.push(this.id);
                    export_columns_names.push(this.string);
                }
            });
            rows = view.$el.find('.oe_list_content > tbody > tr');
            export_rows = [];
            $.each(rows, function () {
                $row = $(this);
                // find only rows with data
                if ($row.attr('data-id')) {
                    export_row = [];
                    checked = $row.find('th input[type=checkbox]').is(':checked');
                    if (children && checked === true) {
                        $.each(export_columns_keys, function () {
                            cell = $row.find('td[data-field="' + this + '"]').get(0);
                            text = cell.text || cell.textContent || cell.innerHTML || "";
                            if (cell.classList.contains("oe_list_field_float")) {
                                export_row.push(instance.web.parse_value(text, {'type': "float"}));
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
                                    tmp = tmp2;
                                    tmp2 = tmp.replace(instance.web._t.database.parameters.thousands_sep, "");
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
                    rows: export_rows
                })},
                complete: $.unblockUI
            });
        }
    });

};
