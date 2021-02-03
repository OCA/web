#  Copyright 2019 LevelPrime
#  License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl)

{
    'name': "Close Wizard Refresh View",
    'summary': """Allow to refresh view data without reload the page.""",
    'version': '12.0.1.0.0',
    'development_status': 'Beta',
    'author': "LevelPrime srl, "
              "Odoo Community Association (OCA)",
    'website': "https://github.com/OCA/web/tree/12.0/"
               "web_ir_actions_close_wizard_refresh_view",
    'license': 'AGPL-3',
    'category': 'Web',
    'depends': ['web'],
    'data': [
        'templates/assets.xml'
    ],
    'application': False,
    'installable': True
}
