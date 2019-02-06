# Copyright 2019 Eficent Business and IT Consulting Services, S.L.
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    'name': "Web Company Background Color",
    'version': '11.0.1.0.0',
    'category': 'Web',
    'author': 'Eficent, '
              'Odoo Community Association (OCA)',
    'website': 'https://github.com/OCA/web',
    'license': 'AGPL-3',
    "depends": [
        'web_widget_color',
        ],
    "data": [
        'view/base_view.xml',
        'view/res_company_view.xml',
        'data/company_data.xml',
        ],
    "auto_install": False,
    'installable': True
}
