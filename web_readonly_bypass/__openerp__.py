# -*- coding: utf-8 -*-
##############################################################################
#
#    Authors: Nemry Jonathan & Laetitia Gangloff
#    Copyright (c) 2014 Acsone SA/NV (http://www.acsone.eu)
#    All Rights Reserved
#
#    WARNING: This program as such is intended to be used by professional
#    programmers who take the whole responsibility of assessing all potential
#    consequences resulting from its eventual inadequacies and bugs.
#    End users who are looking for a ready-to-use solution with commercial
#    guarantees and support are strongly advised to contact a Free Software
#    Service Company.
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
    'name': 'Read Only ByPass',
    'version': '1.0',
    "author": "ACSONE SA/NV",
    "maintainer": "ACSONE SA/NV",
    "website": "http://www.acsone.eu",
    'category': 'Technical Settings',
    'depends': [
        'base',
        'web',
    ],
    'description': """
Read Only ByPass
================
This Module provides a solution to the problem of the interaction between
'readonly' attribute and 'on_change' attribute when used together

Behavior: add `readonly_fields` changed by `on_change` into the fields passing
into an update or create. If `filter_out_readonly` is into the context and set
True then apply native behavior.
    """,
    'images': [],
    'data': [
        'views/readonly_bypass.xml',
    ],
    'qweb': [
    ],
    'css': [],
    'demo': [],
    'test': [],
    'installable': True,
    'auto_install': False,
}
