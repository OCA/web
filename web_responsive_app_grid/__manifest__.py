# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

{
    "name": "Web Responsive App Grid",
    "summary": "Arrange home menu apps freely on a phone-like icon grid",
    "version": "19.0.1.0.0",
    "category": "Website",
    "website": "https://github.com/OCA/web",
    "author": "Daniel Reis, Odoo Community Association (OCA)",
    "maintainers": ["dreispt"],
    "license": "LGPL-3",
    "installable": True,
    "development_status": "Alpha",
    "depends": ["web_responsive"],
    "data": ["views/res_users_views.xml"],
    "assets": {
        "web.assets_backend": [
            "web_responsive_app_grid/static/src/app_grid/*",
        ],
    },
}
