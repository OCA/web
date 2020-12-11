# Copyright 2020 Tecnativa - Alexandre Díaz
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html)

{
    'name': "Web Pivot Computed Measure",
    'category': "web",
    'version': "12.0.1.0.3",
    'author': "Tecnativa, "
              "Odoo Community Association (OCA)",
    'license': 'AGPL-3',
    'website': 'https://github.com/OCA/web',
    'depends': ['web'],
    'data': [
        'view/assets.xml'
    ],
    'qweb': [
        'static/src/xml/web_pivot_computed_measure.xml',
    ],
    'auto_install': False,
    'installable': True,
}
