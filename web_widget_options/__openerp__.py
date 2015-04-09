# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2015 Savoir-faire Linux (<www.savoirfairelinux.com>).
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
    'name': 'Web widget options',
    'version': '0.1',
    'author': 'Savoir-faire Linux',
    'maintainer': 'Savoir-faire Linux',
    'website': 'http://www.savoirfairelinux.com',
    'license': 'AGPL-3',
    'category': 'Account',
    'summary': 'Customize web widgets',
    'description': """
Web widget options
==================

Allow the customization of web widgets using certain rules. Using
a rule to match the group_id or the action_id, it is possible to
remove the button "add item" on one2many fields.


Contributors
------------
* Loïc Faure-Lacroix <loic.lacroix@savoirfairelinux.com>
""",
    'depends': [
    ],
    'data': [
    ],
    'js': [
        'static/src/js/web_widgets.js',
    ],
    'auto_install': False,
    'installable': True,
}
