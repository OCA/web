# Copyright 2026 Sébastien Couratin, Semper Connect
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Web Portal Discuss",
    "summary": "Allow portal users to participate in authorized Discuss channels",
    "version": "18.0.1.0.0",
    "license": "AGPL-3",
    "author": "Sébastien Couratin, Semper Connect, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "category": "Website/Portal",
    "development_status": "Beta",
    "depends": ["mail", "portal", "website"],
    "data": ["views/portal_discuss_templates.xml"],
    "assets": {
        "mail.assets_public": [
            "web_portal_discuss/static/src/js/portal_discuss_assets.js",
            "web_portal_discuss/static/src/js/portal_discuss_client_action.esm.js",
            "web_portal_discuss/static/src/scss/portal_discuss.scss",
        ],
    },
    "installable": True,
    "application": False,
}
