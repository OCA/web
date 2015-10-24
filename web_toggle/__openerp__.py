<<<<<<< HEAD
# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
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
    'name': 'web_toggle',
    'version': '8.0.1.0.0',
    'author': "aimsystems,Odoo Community Association (OCA)",
    'license': 'AGPL-3',
    'website': 'https://github.com/OCA/web',
    'summary': 'Odoo Checkbox Toggle Widget',
    'category': 'Tools',
    'data': ["views/users.xml","toggle_widget.xml"],
    'depends': ['base', 'web'],
=======
# -*- encoding: utf-8 -*-
############################################################################
#
# Odoo, Open Source Web Widget Bootstrap Toggle
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
# @author AIM Systems <phillips@aimsystems.ca>
#
##############################################################################
{
    'name': 'web_widget_bootstrap_toggle',
    'version': '8.0',
    'summary': 'Odoo Checkbox Widget',
    'category': 'Tools',
    'description':
        """
Boolean Bootstrap Toggle Widget
=================
        """,
    'data': [
        "views/users.xml",
        "toggle_widget.xml",
    ],
    'depends': ['base'],
>>>>>>> 97db48bc154e6bc754fafd7fced2e2b2f823f9ef
    'qweb': ['static/src/xml/*.xml'],
    'installable': True,
}
