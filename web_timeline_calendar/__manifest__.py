# Copyright 2019 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    'name': 'Web Timeline Calendar',
    'summary': """
        Timeline view for calendar""",
    'version': '12.0.1.0.0',
    'license': 'AGPL-3',
    'author': 'ACSONE SA/NV, Odoo Community Association (OCA)',
    'website': 'https://acsone.eu/',
    'depends': [
        'calendar',
        'web_timeline',
        'prg_calendar_tree_default_period',
    ],
    'data': [
        'views/calendar_event.xml',
    ],
    'demo': [
    ],
}
