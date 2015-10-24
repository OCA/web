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
    'qweb': ['static/src/xml/*.xml'],
    'installable': True,
}
