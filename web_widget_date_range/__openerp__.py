# -*- coding: utf-8 -*-
##############################################################################
# Copyright (C) 2014 Taktik (http://www.taktik.be)
# @author Adil Houmadi <ah@taktik.be>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################
{
    'name': 'Web Widget Date Range',
    'version': '1.0',
    'category': 'Web',
    'sequence': 1,
    'author': "Taktik,Odoo Community Association (OCA)",
    'summary': 'Extend ListView to date range bar',
    'depends': [
        "web"
    ],
    'data': [
        "views/web_widget_date_range_assets.xml"
    ],
    'qweb': [
        'static/src/xml/web_widget_date_range.xml',
    ],
    'installable': True,
}
