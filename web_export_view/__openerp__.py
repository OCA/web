# -*- coding: utf-8 -*-
# © 2016 Agile Business Group
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    'name': 'Export Current View',
    'version': '9.0.0.1',
    'category': 'Web',
    'author': "Agile Business Group,Odoo Community Association (OCA)",
    'website': 'http://www.agilebg.com',
    'license': 'AGPL-3',
    'depends': [
        'web',
    ],
    'data': [
        'view/web_export_view.xml',
    ],
    'qweb': [
        'static/src/xml/web_export_view_template.xml',
    ],
    'installable': True,
    'auto_install': False,
}
