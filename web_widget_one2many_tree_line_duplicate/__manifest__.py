# Copyright 2021 Tecnativa - Alexandre Díaz
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html)

{
    "name": "Web Widget One2many Tree Line Duplicate",
    "category": "web",
    "version": "19.0.1.0.0",
    "author": "Tecnativa, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "website": "https://github.com/OCA/web",
    "depends": ["web"],
    "auto_install": False,
    "installable": True,
    "assets": {
        "web.assets_backend": [
            (
                "after",
                "/web/static/src/views/list/list_renderer.xml",
                "/web_widget_one2many_tree_line_duplicate/static/src/**/*",
            ),
        ],
    },
}
