# coding: utf-8
# Copyright (C) 2014 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    'name': 'Multicompany - Easy Switch Company',
    'version': '8.0.2.0.0',
    'category': 'web',
    'author': "GRAP,Odoo Community Association (OCA)",
    'website': 'http://www.grap.coop',
    'license': 'AGPL-3',
    'depends': [
        'web',
    ],
    'data': [
        'data/ir_config_parameter.xml',
        'views/templates.xml',
        'views/view_res_users.xml',
    ],
    'qweb': [
        'static/src/xml/switch_company.xml',
    ],
    'demo': [
        'demo/res_groups.xml',
        'demo/res_company.xml',
        'demo/res_users.xml',
    ],
    'images': [
        'static/description/switch_company_menu.png',
    ],
    'installable': True,
}
