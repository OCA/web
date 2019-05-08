# Copyright 2019 Eficent Business and IT Consulting Services S.L.
#   (http://www.eficent.com)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).#
{
    'name': "Web Widget UoM",
    'category': "web",
    'version': "12.0.1.0.0",
    "author": "Eficent, "
              "Odoo Community Association (OCA)",
    'website': 'https://github.com/OCA/web',
    'depends': ['web', 'uom'],
    'data': [
        'view/web_widget_uom_view.xml',
        'view/uom_uom_views.xml',
    ],
    'license': 'AGPL-3',
    'auto_install': False,
    'installable': True,
    'web_preload': True,
}
