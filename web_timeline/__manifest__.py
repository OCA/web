# Copyright 2016 ACSONE SA/NV (<http://acsone.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    'name': "Web timeline",
    'summary': "Interactive visualization chart to show events in time",
    "version": "12.0.1.1.1",
    "development_status": "Production/Stable",
    'author': 'ACSONE SA/NV, '
              'Tecnativa, '
              'Monk Software, '
              'Onestein, '
              'Odoo Community Association (OCA)',
    "category": "web",
    "license": "AGPL-3",
    "application": False,
    "installable": True,
    "website": "https://github.com/OCA/web",
    'depends': [
        'web',
    ],
    'qweb': [
        'static/src/xml/web_timeline.xml',
    ],
    'data': [
        'views/web_timeline.xml',
    ],
    "maintainers": ["tarteo"],
}
