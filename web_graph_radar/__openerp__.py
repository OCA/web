# -*- coding: utf-8 -*-
##############################################################################
#
#    Author: Veronika Kotovich @ IT-PROJECTS
#    Copyright (C) 2016 Veronika Kotovich <veronika.kotovich@gmail.com>
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
    'name': 'Radar Chart',
    'version': '8.0.0.1.0',
    'category': 'Web',
    'summary': 'Add graph radar view.',
    'author': "Veronika Kotovich,IT-Projects LLC,Odoo Community Association (OCA)",
    'license': 'AGPL-3',
    'website': 'https://twitter.com/vkotovi4',
    'depends': ['web_graph'],
    'qweb': ['static/src/xml/web_graph_radar.xml'],
    'data': ['view/web_graph_radar.xml'],
    'installable': True,
    'auto_install': False,
}
