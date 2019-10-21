# -*- coding: utf-8 -*-
# Copyright <2019> Pesol <pedro.gonzalez@pesol.es>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "mail_chatt_filtering",
    "summary": """
        Extend the mail_chatt functionality to have filtering by author or by
         message content
    """,
    "category": "web",
    "author": "Pedro Gonzalez <pedro.gonzalez@pesol.es> ,"
    "Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "website": "https://github.com/OCA/web",
    "version": "13.0.1.0.0",
    "depends": ["mail"],
    "data": ["views/templates.xml"],
    "qweb": ["static/src/xml/chatter.xml"],
}
