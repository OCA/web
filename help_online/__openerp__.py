# -*- coding: utf-8 -*-
##############################################################################
#
#    Authors: Nemry Jonathan
#    Copyright (c) 2014 Acsone SA/NV (http://www.acsone.eu)
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as published
#    by the Free Software Foundation, either version 3 of the License, or
#    (at your option) any later version.
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
    'name': 'Help Online',
    'version': '1.0',
    'author': 'ACSONE SA/NV',
    'maintainer': 'ACSONE SA/NV',
    'website': 'http://www.acsone.eu',
    'category': 'Documentation',
    'depends': [
        'base',
        'website',
    ],
    'description': """
Help Online
===========

This module allows the creation of an online help available from the lists
and forms in Odoo.

When loading a view, the module generates a button allowing access to an help
page for the related model if the page exists and the user is member of the
group 'Help reader'. If the page doesn't exist and the user is member of
the group 'Help writer', the module generate a button allowing the creation an
help page.

The help pages are created and managed via the website Module.
    """,
    'data': [
        'data/help_auto_backup.xml',  # must always be the first
        'security/help_online_groups.xml',
        'views/help_online_view.xml',
        'views/website_help_online.xml',
        'views/ir_ui_view_view.xml',
        'views/export_help_wizard_view.xml',
        'data/ir_config_parameter_data.xml',
    ],
    'qweb': [
        'static/src/xml/help_online.xml',
    ],
    'installable': True,
    'auto_install': False,
}
