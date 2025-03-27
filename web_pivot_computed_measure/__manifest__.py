# Copyright 2020 Tecnativa - Alexandre Díaz
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html)
{
    "name": "Web Pivot Computed Measure",
    "category": "web",
    "version": "18.0.1.0.2",
    "author": "Tecnativa, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "website": "https://github.com/OCA/web",
    "depends": ["web"],
    "auto_install": False,
    "installable": True,
    "maintainers": ["CarlosRoca13"],
    "demo": [
        "demo/demo_users_pivot_view.xml",
    ],
    "assets": {
        "web.assets_backend": [
            "web_pivot_computed_measure/static/src/**/*.esm.js",
            "web_pivot_computed_measure/static/src/**/*.scss",
            "web_pivot_computed_measure/static/src/**/*.xml",
            ("remove", "web_pivot_computed_measure/static/src/test/*.esm.js"),
            ("remove", "web_pivot_computed_measure/static/src/pivot/*"),
        ],
        "web.assets_backend_lazy": [
            "web_pivot_computed_measure/static/src/pivot/*",
        ],
        "web.assets_tests": [
            "web_pivot_computed_measure/static/src/test/test.esm.js",
        ],
    },
}
