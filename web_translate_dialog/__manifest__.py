# -*- coding: utf-8 -*-
# Copyright 2012 Guewen Baconnier (Camptocamp SA)
# Copyright 2016 Antonio Espinosa <antonio.espinosa@tecnativa.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Web Translate Dialog",
    "summary": "Easy-to-use pop-up to translate fields in several languages",
    "version": "10.0.1.0.0",
    "category": "Web",
    "website": "https://odoo-community.org/",
    "author": "Camptocamp, "
              "Tecnativa, "
              "Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "application": False,
    'installable': True,
    "depends": [
        "web",
    ],
    "data": [
        "view/web_translate.xml",
    ],
    "qweb": [
        "static/src/xml/base.xml",
    ]
}
