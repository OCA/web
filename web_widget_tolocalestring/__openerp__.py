# -*- coding: utf-8 -*-
# (c) 2016 Tony Galmiche / InfoSaône
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "toLocaleString Web Widget",
    "summary": """
'tolocalestring' widget improves numbers formatting or allows to not display
the 0 values.""",
    "version": "8.0.1.0.0",
    "category": "web",
    "website": "http://www.infosaone.com/",
    "author": "Tony Galmiche, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "application": False,
    "installable": True,
    "depends": [
        "base", "web",
    ],
    "data": [
        "views/assets.xml",
    ],
    "qweb": [
        "static/src/xml/widget.xml",
    ]
}
