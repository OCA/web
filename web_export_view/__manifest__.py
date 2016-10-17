# -*- coding: utf-8 -*-
# Copyright 2016 Henry Zhou (http://www.maxodoo.com)
# Copyright 2016 Rodney (http://clearcorp.cr/)
# Copyright 2012 Agile Business Group
# Copyright 2012 Therp BV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    'name': "Web Export Current View",
    'version': '10.0.0.1',
    'category': 'Web',
    'author': 'Henry Zhou (MAXodoo), '
              'Rodney, '
              'Odoo Community Association (OCA)',
    'website': 'http://www.maxodoo.com',
    'license': 'AGPL-3',
    "depends": [
        'web',
    ],
    "data": [
        'views/web_export_view_view.xml',
    ],
    'qweb': [
        "static/src/xml/web_export_view_template.xml",
    ],
    "auto_install": False,
    'installable': True
}
