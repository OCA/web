# Copyright 2019 LevelPrime
# Copyright 2023 Nova Code (https://www.novacode.nl)
#  License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl)

{
    "name": "Close Wizard Refresh View",
    "summary": """Allow to refresh view data without reload the page.""",
    "version": "16.0.1.0.0",
    "development_status": "Beta",
    "author": "LevelPrime srl, Nova Code, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "category": "Web",
    "depends": ["web"],
    "data": ["security/ir.model.access.csv"],
    "assets": {
        "web.assets_backend": [
            "web_ir_actions_close_wizard_refresh_view/static/src/js/*.js"
        ]
    },
    "application": False,
    "installable": True,
}
