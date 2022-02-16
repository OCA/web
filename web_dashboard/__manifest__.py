# Copyright 2022 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Web Dashboard",
    "summary": """Create simplified dashboards using window actions""",
    "version": "13.0.1.0.0",
    "license": "AGPL-3",
    "author": "ACSONE SA/NV, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "depends": ["board"],
    "data": [
        "data/ir_ui_menu.xml",
        "security/web_dashboard.xml",
        "security/web_dashboard_action.xml",
        "views/template.xml",
        "views/web_dashboard.xml",
        "views/web_dashboard_action.xml",
    ],
    "demo": ["demo/web_dashboard.xml"],
    "qweb": ["static/src/xml/web_dashboard.xml"],
}
