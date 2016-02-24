# -*- coding: utf-8 -*-
# © 2015 ONESTEiN BV (<http://www.onestein.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    'name': 'Web Calendar Year',
    'images': ['static/description/main_screenshot.png'],
    'summary': """Year view on Odoo calendar""",
    'author': 'ONESTEiN BV,Odoo Community Association (OCA)',
    'license': 'AGPL-3',
    'website': 'http://www.onestein.eu',
    'category': 'Web',
    'version': '8.0.1.0.0',
    'depends': ['web_calendar'],
    'data': [
        'views/web_calendar_year.xml',
    ],
    'demo': [],
    'installable': True,
    'auto_install': False,
    'application': False,
}
