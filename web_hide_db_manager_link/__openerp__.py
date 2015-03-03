# -*- coding: utf-8 -*-
##############################################################################
#
#    Odoo, Open Source Management Solution
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
    'name': 'Hide link to database manager in login screen',
    'version': "1.0",
    'category': 'Web',
    'license': 'AGPL-3',
    'author': 'Alejandro Santana, Odoo Community Association (OCA)',
    'website': 'http://anubia.es',
    'summary': 'Hide link to database manager in login screen',
    'description': '''
**Hide link to database manager in login screen**

This module hides the "Manage Databases" link at the bottom of login screen.
As in Odoo v8 templates only live in the database, this module must be
installed in each database you want this to be in effect.

The image below shows the resulting loging screen:

.. image:: web_hide_db_manager_link/static/src/img/screenshot.png

**Notes:**

- In case this module is not shown in your module list by default,
click on "Update Module List" and clear any filter to show all modules.
- Loosely based on the idea from Vauxoo OpeERP v7.0 module "web_nocreatedb":
  https://github.com/OCA/web/tree/7.0/web_nocreatedb

''',
    'depends': [
        'web',
    ],
    'data': [
        'views/webclient_templates.xml',
    ],
    'icon': 'web_hide_db_manager_link/static/src/img/icon.png',
    'installable': True,
}
