# Copyright 2025 Dixmit
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Web Portal Properties",
    "summary": """Add a new field on properties to show them on portal""",
    "version": "18.0.1.0.0",
    "license": "AGPL-3",
    "author": "Dixmit,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "depends": ["portal"],
    "data": ["views/portal_templates.xml"],
    "demo": [],
    "assets": {
        "web.assets_backend": [
            "web_portal_properties/static/src/**/*.esm.js",
            "web_portal_properties/static/src/**/*.xml",
        ],
        "web.assets_unit_tests": [
            "web_portal_properties/static/tests/**/*.test.js",
        ],
    },
}
