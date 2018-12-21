# -*- coding: utf-8 -*-
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "Web - Sheets for Widescreen",
    "version": "10.0.1.0.1",
    "author": "Mark Robinson, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "summary": "Clone of web_sheet_full_width, but instead of full screen sheets, "
               "adds an additional media query to make sheets a bit wider on widescreen displays.",
    "category": "Tools",
    "depends": [
        'web',
    ],
    "data": [
        "view/qweb.xml",
    ],
    "installable": True,
}