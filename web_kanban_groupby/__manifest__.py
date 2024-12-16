# Copyright 2024 Tecnativa - David Vidal
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html)
{
    "name": "Web Kanban groupby",
    "category": "web",
    "version": "15.0.1.0.5",
    "author": "Tecnativa, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "website": "https://github.com/OCA/web",
    "depends": ["web"],
    "installable": True,
    "assets": {
        "web.assets_qweb": [
            "/web_kanban_groupby/static/src/**/*.xml",
        ],
        "web.assets_backend": [
            "/web_kanban_groupby/static/src/**/*.esm.js",
            "/web_kanban_groupby/static/src/**/*.scss",
        ],
    },
}
