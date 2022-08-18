# Copyright 2012 Agile Business Group
# Copyright 2012 Domsense srl (<http://www.domsense.com>)
# Copyright 2012 Therp BV
# Copyright 2016 Henry Zhou (http://www.maxodoo.com)
# Copyright 2016 Rodney (http://clearcorp.cr/)
# Copyright 2019 Tecnativa
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    'name': 'Web Export Current View',
    'version': '12.0.1.0.1',
    'category': 'Web',
    'author': 'Henry Zhou, Agile Business Group, \
            Odoo Community Association (OCA)',
    'website': 'https://github.com/OCA/web',
    'license': 'AGPL-3',
    'depends': [
        'web',
    ],
    "data": [
        'security/groups.xml',
        'views/web_export_view_view.xml',
    ],
    'qweb': [
        "static/src/xml/web_export_view_template.xml",
    ],

    'installable': True,
    'auto_install': False,
}
