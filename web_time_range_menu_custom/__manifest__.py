# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

{
    "name": "Web Time Range Menu Custom",
    "version": "16.0.1.0.0",
    "author": "Tecnativa, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "website": "https://github.com/OCA/web",
    "depends": ["web"],
    "installable": True,
    "auto_install": False,
    "assets": {
        "web.assets_backend": [
            "/web_time_range_menu_custom/static/src/js/*.esm.js",
            "/web_time_range_menu_custom/static/src/scss/*.scss",
            "/web_time_range_menu_custom/static/src/xml/*.xml",
        ],
    },
}
