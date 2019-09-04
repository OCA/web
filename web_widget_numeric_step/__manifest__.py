# Odoo, Open Source Web Widget Numeric Step
#
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).#
{
    'name': "Web Widget Numeric Step",
    'category': "web",
    'version': "12.0.1.0.0",
    'author': "GRAP, "
              "Odoo Community Association (OCA)",
    'license': 'AGPL-3',
    'website': 'https://github.com/OCA/web',
    'depends': ['web'],
    'data': [
        'view/web_widget_numeric_step.xml'
    ],
    'qweb': [
        'static/src/xml/numeric_step.xml',
    ],
    'auto_install': False,
    'installable': True,
}
