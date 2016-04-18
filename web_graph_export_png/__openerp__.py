# -*- coding: utf-8 -*-
# © 2016 IT-Projects <https://www.it-projects.info>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    'name': 'Graph Export to PNG',
    'version': '8.0.1.0.0',
    'category': 'Web',
    'summary': 'Add graph export to png option.',
    'author': "IT-Projects LLC,Odoo Community Association (OCA)",
    'license': 'AGPL-3',
    'website': 'https://twitter.com/vkotovi4',
    'depends': ['web_graph'],
    'qweb': ['static/src/xml/web_graph_export_png.xml'],
    'data': ['view/web_graph_export_png.xml'],
    'installable': True,
    'auto_install': False,
}