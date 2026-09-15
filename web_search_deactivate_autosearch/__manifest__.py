# Copyright 2025 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "Web Search Deactivate Autosearch",
    "summary": "Allow user to deactivate autosearch to add multiple filters",
    "version": "19.0.1.0.0",
    "development_status": "Beta",
    "category": "Web",
    "website": "https://github.com/OCA/web",
    "author": "ACSONE SA/NV, Odoo Community Association (OCA)",
    "maintainers": ["samirGuesmi", "AnizR"],
    "license": "AGPL-3",
    "installable": True,
    "depends": ["web"],
    "assets": {
        "web.assets_backend": [
            "web_search_deactivate_autosearch/static/src/search/search_model.esm.js",
            "web_search_deactivate_autosearch/static/src/search/search_bar/*",
        ],
    },
}
