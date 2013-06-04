//  @@@ web_export_view custom JS @@@
//#############################################################################
//    
//    Copyright (C) 2012 Agile Business Group sagl (<http://www.agilebg.com>)
//    Copyright (C) 2012 Therp BV (<http://therp.nl>)
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU Affero General Public License as published
//    by the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU Affero General Public License for more details.
//
//    You should have received a copy of the GNU Affero General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.
//
//#############################################################################

openerp.web_export_view = function(openerp) {

    _t = openerp.web._t;

    openerp.web.Sidebar = openerp.web.Sidebar.extend({

        add_default_sections: function() {
            // IMHO sections should be registered objects
            // as views and retrieved using a specific registry
            // so that we don't have to override this
            
            var self = this,
            view = this.widget_parent,
            view_manager = view.widget_parent,
            action = view_manager.action;
            if (this.session.uid === 1) {
                this.add_section(_t('Customize'), 'customize');
                this.add_items('customize', [{
                    label: _t("Translate"),
                    callback: view.on_sidebar_translate,
                    title: _t("Technical translation")
                }]);
            }

            this.add_section(_t('Other Options'), 'other');
            this.add_items('other', [
                {
                    label: _t("Export"),
                    callback: view.on_sidebar_export
                },
                {
                    label: _t("Export current view"),
                    callback: this.on_sidebar_export_view
                }
            ]);
        },

        on_sidebar_export_view: function() {
            // Select the first list of the current (form) view
            // or assume the main view is a list view and use that
            var self = this,
            view = this.widget_parent; // valid for list view
            if (view.widget_children) {
                view.widget_children.every(function(child) {
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
            var columns = view.visible_columns;
            export_columns_keys = [];
            export_columns_names = [];
            $.each(columns,function(){
                if(this.tag=='field'){
                    // non-fields like `_group` or buttons
                    export_columns_keys.push(this.id);
                    export_columns_names.push(this.string);
                }
            });
            rows = view.$element.find('.ui-widget-content tr');
            export_rows = [];
            $.each(rows,function(){
                $row = $(this);
                // find only rows with data
                if($row.attr('data-id')){
                    export_row = [];
                    $.each(export_columns_keys,function(){
                        cell = $row.find('td[data-field="'+this+'"]').get(0);
                        text = cell.text || cell.textContent || cell.innerHTML || "";
                        export_row.push(text.trim());
                    });
                    export_rows.push(export_row);
                }
            });
            $.blockUI();
            view.session.get_file({
                url: '/web/export/xls_view',
                data: {data: JSON.stringify({
                    model : view.model,
                    headers : export_columns_names,
                    rows : export_rows,
                })},
                complete: $.unblockUI
            });
        },

    });

}
