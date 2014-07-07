# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    This module copyright (C) 2013 Therp BV (<http://therp.nl>).
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
    "name": "CSS classes for widgets",
    "version": "1.0",
    "author": "Therp BV",
    "complexity": "normal",
    "description": """
    For simple UI changes, having classes attached to widgets giving
    information about the model being displayed can be essential.

    For instance, to apply some CSS to the name field in forms for tasks,

    ::

      .oe_model_project_task input[name='name']
      {
          //your CSS
      }

    will be enough.
    """,
    "category": "Dependency",
    "depends": [
        'web',
    ],
    "data": [
    ],
    "js": [
    ],
    "css": [
    ],
    "qweb": [
        'static/src/xml/web_widget_classes.xml',
    ],
    "auto_install": False,
    "installable": True,
    "external_dependencies": {
        'python': [],
    },
}
