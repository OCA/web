# Copyright 2020 Tecnativa - Alexandre D. Díaz
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    'name': 'Web Widget One2Many Product Picker',
    'summary': 'Widget to select products on one2many fields',
    'version': '12.0.2.4.1',
    'category': 'Website',
    'author': "Tecnativa, "
              "Odoo Community Association (OCA)",
    'website': 'https://www.tecnativa.com',
    'license': 'AGPL-3',
    'depends': [
        'product',
    ],
    'data': [
        'templates/assets.xml',
    ],
    'qweb': [
        'static/src/xml/one2many_product_picker.xml',
    ],
    'installable': True,
    'auto_install': False,
}
