# -*- coding: utf-8 -*-
# © 2016 ACSONE SA/NV (<http://acsone.eu>)
# © 2018 Jose Zambudio (<zamberjo@gmail.com>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    'name': "Web timeline",
    'summary': """
        Interactive visualization chart to visualize events in time
    """,
    "version": "8.0.1.0.0",
    'author': 'ACSONE SA/NV,'
              'Jose Zambudio Bernabeu <zamberjo@gmail.com>,'
              'Odoo Community Association (OCA)',
    "category": "Tools",
    "website": "http://acsone.eu",
    'depends': [
        'web'
    ],
    'qweb': [
        'static/src/xml/web_timeline.xml',
    ],
    'data': [
        'views/web_timeline.xml',
    ],
}
