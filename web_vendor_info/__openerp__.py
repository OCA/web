# -*- encoding: utf-8 -*-
##############################################################################
#
#    Web Vendor Info, Open Source Management Solution
#    Copyright (C) 2015 ABF Osiell (http://osiell.com)
#                       Sebastien Alix (https://twitter.com/seb_alix)
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################

{
    'name': "Vendor Information",
    'version': '1.0',
    'category': 'web',
    'description': """
Display the vendor's name and the current release number
==========================================================

This module replaces the `Powered by OpenERP` at the bottom of the Web
interface by the vendor's name, and optionally the release number.

Configuration
=============

These new configuration parameters are available:

    * ``web_vendor_name``
    * ``web_vendor_release``
    """,
    'author': 'ABF OSIELL',
    'maintainer': 'ABF OSIELL',
    'website': 'http://www.osiell.com',
    'depends': [
        'web',
    ],
    'data': [
        'data/config.xml',
    ],
    'js': [
        'static/src/js/vendor_info.js',
    ],
    'qweb': [
        'static/src/xml/vendor_info.xml',
    ],
    'css': [
        'static/src/css/vendor_info.css',
    ],
    'installable': True,
    'auto_install': False,
}
