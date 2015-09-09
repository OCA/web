//-*- coding: utf-8 -*-
//############################################################################
//
//   This module copyright (C) 2015 Therp BV <http://therp.nl>.
//
//   This program is free software: you can redistribute it and/or modify
//   it under the terms of the GNU Affero General Public License as
//   published by the Free Software Foundation, either version 3 of the
//   License, or (at your option) any later version.
//
//   This program is distributed in the hope that it will be useful,
//   but WITHOUT ANY WARRANTY; without even the implied warranty of
//   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//   GNU Affero General Public License for more details.
//
//   You should have received a copy of the GNU Affero General Public License
//   along with this program.  If not, see <http://www.gnu.org/licenses/>.
//
//############################################################################

openerp.web_download_disable_iframe = function(instance)
{
    instance.web.Session.include({
        get_file: function (options)
        {
            //this is basically a copy of the beginning of super, until the
            //check for i{Pod,Phone,Pad}
            var token = new Date().getTime(),
                params = _.extend({}, options.data || {}, {token: token});
                url = this.url(options.url, params);
            instance.web.unblockUI();
            return window.open(url);
        },
    });
}
