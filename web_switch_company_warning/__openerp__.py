# -*- coding: utf-8 -*-
# © <2015> <Akretion, OCA>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "Multicompany - Switch Company Warning",
    "summary": "Shows a warning if current company has been switched in another tab or window."
    "version": "0.1",
    "category": "web",
    "website": "https://github.com/OCA/web/blob/8.0/web_switch_company_warning",
    "license": "AGPL-3",
    "author": "Akretion / Odoo Community Association (OCA)",
    "depends": [
        'web',
    ],
    "data": [
        "view/view.xml",
    ],
    "qweb": [
        "static/src/xml/switch_company_warning.xml",
    ],
    "installable": True,
    "application": False,
}
