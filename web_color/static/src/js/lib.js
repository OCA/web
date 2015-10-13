/*############################################################################
#    
#    OpenERP, Open Source Web Color
#    Copyright (C) 2012 Savoir-faire Linux (<http://www.savoirfairelinux.com>).
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU General Public License for more details.
#
#    You should have received a copy of the GNU General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>. 
#  
#    @author Étienne Beaudry Auger <etienne.b.auger@savoirfairelinux.com>
#
##############################################################################*/

openerp.web_color = function(instance) {
    
    widget_name = 'color';
    //Add in the widgets list
    instance.web.form.widgets.add(widget_name, 'openerp.web_color'); 
    //Add object in the column list
    instance.web.list.columns.add('field.color', 'instance.web.list.Color'); 
    //instance of the widget itself
    instance.web.list.Color = instance.web.list.Column.extend({
        /**
         * Return a formatted div colored and display the hexa color code
         * from row_data
         *
         * @private
         */
        _format: function (row_data, options) {
            return _.template(
                '<div class="colorviewer" style="background-color: <%-colorCode%>"></div>\
                <label style="padding-left: 5px"><%-colorCode%></label>', {
                    colorCode: row_data[this.id].value
                });

        }
    });
}
