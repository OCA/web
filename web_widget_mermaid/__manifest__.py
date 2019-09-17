# -*- coding: utf-8 -*-
# Copyright 2019 Therp BV <https://therp.nl>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html)

{
    "name": "Mermaid flowchart widget",
    "category": "Web",
    "author": "Therp BV,Odoo Community Association (OCA)",
    "version": "10.0.8.4.0",
    "license": "AGPL-3",
    "summary": "Render mermaid markdown flowcharts",
    "website": "https://github.com/OCA/web",
    "depends": ['web'],
    "data": [
        "view/web_widget_mermaid_view.xml",
    ],
    "js": [
        "static/lib/mermaid/mermaid.js",
        "static/src/js/web_widget_mermaid.js",
    ],
    "qweb": [
        "static/src/xml/web_widget_mermaid.xml",
    ],
    "demo": [
        "demo/res_users_flowchart.xml",
    ],
}
