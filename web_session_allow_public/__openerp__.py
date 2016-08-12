# -*- coding: utf-8 -*-
# Copyright 2016 LasLabs Inc.
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "Web Session Public DataModel",
    "summary": "Allow for a public session to utilize the JsonRpc",
    "version": "9.0.1.0.0",
    "category": "Website",
    "website": "https://laslabs.com/",
    "author": "LasLabs, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "application": False,
    "installable": True,
    "depends": [
        "web",
        "website",  # Required to test sandbox break
    ],
    "demo": [
        "demo/web_session_allow_public_demo.xml",
    ]
}
