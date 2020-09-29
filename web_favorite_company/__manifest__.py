# Copyright (C) 2020 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "Web - Favorite Companies",
    "summary": "Add Favorite companies and improve"
    " the diplay of the list of the companies",
    "version": "12.0.1.0.0",
    "category": "Web",
    "website": "https://github.com/OCA/web",
    "author": "GRAP,Odoo Community Association (OCA)",
    "license": "LGPL-3",
    "installable": True,
    "depends": ["web_responsive"],
    "data": [
        "views/assets.xml",
        "views/view_res_users.xml",
    ],
    "qweb": [
        "static/src/xml/web_favorite_company.xml",
    ],
    "demo": [
        "demo/res_groups.xml",
        "demo/res_company.xml",
        "demo/res_users.xml",
    ],
}
