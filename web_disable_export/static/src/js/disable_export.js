/*
##############################################################################
#
#    OpenERP, Open Source Management Solution
#
#    Copyright (c) 2014 Noviat nv/sa (www.noviat.com). All rights reserved.
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program. If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################
*/

openerp.web_disable_export = function(instance) {

    var _t = instance.web._t;
    var SUPERUSER_ID = 1;

    instance.web.Sidebar.include({

        add_items: function(section_code, items) {
            // allow Export for admin user
            if (this.session.uid == SUPERUSER_ID) {
                this._super.apply(this, arguments);
            }
            else {
                var export_label = _t("Export");
                var new_items = items;
                if (section_code == 'other') {
                    new_items = [];
                    for (var i = 0; i < items.length; i++) {
                        console.log("items[i]: ", items[i]);
                        if (items[i]['label'] != export_label) {
                            new_items.push(items[i]);
                        };
                    };
                };
                if (new_items.length > 0) {
                    this._super.call(this, section_code, new_items);
                };
            }
            
        },

    });

};
