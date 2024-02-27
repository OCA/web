# Copyright 2020 Tecnativa - Alexandre Díaz
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html)
{
    "name": "Web Pivot Computed Measure",
    "category": "web",
    "version": "16.0.1.0.0",
    "author": "Tecnativa, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "website": "https://github.com/OCA/web",
    "depends": ["web"],
    "auto_install": False,
    "installable": True,
    "maintainers": ["CarlosRoca13"],
    "assets": {
        "web.assets_backend": [
            "/web_pivot_computed_measure/static/src/**/*.esm.js",
            "/web_pivot_computed_measure/static/src/**/*.scss",
            ("remove", "/web_pivot_computed_measure/static/src/test/*.esm.js"),
            "/web_pivot_computed_measure/static/src/**/*.xml",
        ],
        "web.assets_tests": [
            "/web_pivot_computed_measure/static/src/test/test.esm.js",
        ],
    },
}
