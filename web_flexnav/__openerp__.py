# -*- coding: utf-8 -*-
##############################################################################
#
# Odoo, an open source suite of business apps
# This module copyright (C) 2015 bloopark systems (<http://bloopark.de>).
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program. If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################
{
    'name': 'Flexnav for Backend Smart buttons',
    'category': 'Generic Modules',
    'summary': 'Smart buttons in Partner Views',
    'version': '1.0',
    'author': "bloopark systems GmbH & Co. KG",
    'website': "http://www.bloopark.de",
    'depends': [
        'base',
        'sale',
        'web',
    ],
    'data': [
        'views/assets.xml',
        'views/res_partner.xml',
    ],
    'demo': [],
    'installable': True,
    'auto_install': False,
}
