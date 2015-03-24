# -*- encoding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    This module copyright (C) 2015 Savoir-faire Linux
#    (<http://www.savoirfairelinux.com>).
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
    "name": 'web_widget_datepicker_options',
    "version": "1.0",
    "description": """
===========================================
Allow passing options to datepicker widgets
===========================================

This will set all options specified in the "datepicker" option of datetime
fields to the datepicker.

See http://api.jqueryui.com/datepicker/ for options

Example:
--------

  <field name="birthdate" options="{'datepicker':{'yearRange': 'c-100:c+0'}}"/>

Contributors:
-------------

- Vincent Vinet <vincent.vinet@savoirfairelinux.com>

""",
    "depends": [
        'base',
        'web',
    ],
    "js": [
        'static/src/js/datepicker.js',
    ],
    "author": "Vincent Vinet",
    "installable": True,
    "active": False,
}
