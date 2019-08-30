# Odoo, Open Source Web Widget Integer Choice
#
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).#
{
    'name': "Web Widget UX Number Choice",
    'category': "web",
    'version': "12.0.1.0.0",
    'author': "GRAP, "
              "Odoo Community Association (OCA)",
    'license': 'AGPL-3',
    'website': 'https://github.com/OCA/web',
    'depends': ['web'],
    'data': [
        'view/web_widget_number_ux_choice.xml'
    ],
    'qweb': [
        'static/src/xml/number_ux_choice.xml',
    ],
    'auto_install': False,
    'installable': True,
}
