/******************************************************************************

    Web Vendor Info module for OpenERP
    Copyright (C) 2015 ABF OSIELL SARL (http://osiell.com)
                       Sebastien Alix (https://twitter.com/seb_alix)

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

******************************************************************************/

openerp.web_vendor_info = function (instance) {

    /**************************************************************************
    Create an new 'VendorInfoWidget' widget
    **************************************************************************/
    instance.web.VendorInfoWidget = instance.web.Widget.extend({

        template: 'VendorInfoWidget',

        init: function(parent) {
            this._super(parent);
            this.release = '';
            this.vendor = '';
            this._load_data();
        },

        _fetch: function(model, fields, domain){
            return new instance.web.Model(model).query(fields).filter(domain).all();
        },

        _load_data: function() {
            var self = this
            query = self._fetch('res.company', ['vendor_name', 'vendor_release'])
            query.then(function(result) {
                self.vendor = result[0].vendor_name;
                self.release = result[0].vendor_release
                self._display_data();
            });
        },

        _display_data: function() {
            if (this.vendor) {
                instance.webclient.$el.find('.oe_footer').html('');
                this.appendTo(instance.webclient.$el.find('.oe_footer'));
            };
        },

    });

    /**************************************************************************
    Extend 'WebClient' Widget to insert a 'VendorInfoWidget' widget
    only if required data to display are available.
    **************************************************************************/
    instance.web.WebClient.include({

        start: function() {
            return $.when(this._super()).then(function() {
                new instance.web.VendorInfoWidget();
            });
        },

    });

};
