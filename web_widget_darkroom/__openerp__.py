# -*- coding: utf-8 -*-
# Copyright 2016-2017 LasLabs Inc.
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

{
    'name': 'Web DarkroomJS Image Editing',
    'summary': 'Provides web widget for image editing and adds it to standard'
               ' image widget as modal',
    'version': '9.0.1.0.1',
    'category': 'Web',
    'website': 'https://laslabs.com/',
    'author': 'LasLabs, Odoo Community Association (OCA)',
    'license': 'LGPL-3',
    'application': False,
    'installable': True,
    'depends': [
        'web',
    ],
    'data': [
        'views/assets.xml',
        'wizards/darkroom_modal.xml',
    ],
    'qweb': [
        'static/src/xml/field_templates.xml',
    ],
}
