# Copyright (C) 2021 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "Web Responsive - Company Menu",
    "summary": "Improve the diplay of the list of the companies",
    "version": "12.0.1.0.0",
    "category": "Web",
    "website": "https://github.com/OCA/web",
    "author": "GRAP,Odoo Community Association (OCA)",
    "license": "LGPL-3",
    "installable": True,
    "depends": ["web_responsive"],
    "data": [
        "views/assets.xml",
    ],
    "qweb": [
        "static/src/xml/web_responsive_company.xml",
    ],
    "demo": [
        "demo/res_groups.xml",
        "demo/res_company.xml",
    ],
}
