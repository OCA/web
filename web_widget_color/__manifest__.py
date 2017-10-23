# -*- coding: utf-8 -*-
# Odoo, Open Source Web Widget Color
# Copyright (C) 2012 Savoir-faire Linux (<http://www.savoirfairelinux.com>).
# Copyright (C) 2014 Anybox <http://anybox.fr>
# Copyright (C) 2015 Taktik SA <http://taktik.be>
#
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).#
{
    'name': "Web Widget Color",
    'category': "web",
    'version': "11.0.1.0.0",
    "author": "Savoir-faire Linux, "
              "Anybox, "
              "Taktik SA, "
              "Sudokeys, "
              "Odoo Community Association (OCA)",
    'depends': ['base', 'web'],
    'data': [
        'view/web_widget_color_view.xml'
    ],
    'qweb': [
        'static/src/xml/widget.xml',
    ],
    'license': 'AGPL-3',
    'auto_install': False,
    'installable': True,
    'web_preload': True,
}
