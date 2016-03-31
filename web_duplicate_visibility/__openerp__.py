# -*- coding: utf-8 -*-
# © 2016 Pierre Verkest <pverkest@anybox.fr>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
{
    "name": "web_duplicate_visibility",
    "summary": "Manage the duplicate button visibiliy",
    "version": "9.0.1.0.0",
    "category": "web",
    "website": "https://odoo-community.org/",
    "author": "Pierre Verkest <pverkest@anybox.fr>,"
              " Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "application": False,
    "installable": True,
    "depends": [
        "base",
        "web",
    ],
    "data": [
        "views/assets.xml",
    ],
    "demo": [
        "demo/res_users_view.xml",
    ],
}
