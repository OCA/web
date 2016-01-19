# -*- coding: utf-8 -*-
# © Vauxoo <nhomar@vauxoo.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "Web Hide Left Menu",
    "summary": "Hide left Menu in Web interface",
    "version": "8.0.1.0.0",
    "category": "Hidden",
    "website": "https://odoo-community.org/",
    "author": "Vauxoo, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "application": False,
    "installable": True,
    "depends": [
        "web",
    ],
    "data": [
        "web_hideleftmenu_js.xml",
    ],
    "qweb": [
        "static/src/xml/lib.xml",
    ],
}
