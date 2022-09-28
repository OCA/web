# Copyright 2019 Therp BV <https://therp.nl>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html)

{
    "name": "Mermaid flowchart widget",
    "category": "Web",
    "author": "Therp BV,Odoo Community Association (OCA)",
    "version": "15.0.1.0.0",
    "license": "AGPL-3",
    "summary": "Render mermaid markdown flowcharts",
    "website": "https://github.com/OCA/web",
    "depends": ["web"],
    "demo": [
        "demo/res_users_flowchart.xml",
    ],
    "assets": {
        "web.assets_common": [
            "https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js",
            "web_widget_mermaid/static/src/js/web_widget_mermaid.js",
        ],
    },
}
