# -*- coding: utf-8 -*-
##############################################################################
#
#    Copyright (c) All rights reserved:
#        (c) 2015      Anubía, soluciones en la nube,SL (http://www.anubia.es)
#                      Alejandro Santana <alejandrosantana@anubia.es>
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
#    along with this program.  If not, see http://www.gnu.org/licenses
#
##############################################################################
{
    'name': 'Optional Developer Mode link',
    'version': '0.4',
    'category': 'Generic Modules/Others',
    'summary': ('This module adds group-based permissions '
                'for the Developer Mode.'),
    'author': ('Odoo Community Association (OCA), '
               'Alejandro Santana'),
    'maintainer': 'Odoo Community Association (OCA)',
    'website': 'http://odoo-community.org',
    'license': 'AGPL-3',
    'depends': [
        'web',
    ],
    'data': [
        'security/web_developer_mode_optional_security.xml',
        'views/webclient_templates.xml',
    ],
    'js': [
        'static/src/js/chrome.js',
    ],
    'installable': True,
    'application': True,
    'auto_install': False,
}
