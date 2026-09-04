# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "Web Sheet Full Width",
    "version": "19.0.1.0.0",
    "author": "Therp BV, Sudokeys, GRAP, Métal Sartigan, "
    "Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "summary": "Use the whole available screen width when displaying sheets",
    "category": "Tools",
    "depends": ["web"],
    # 19.0: el bundle web.assets_common desaparecio del core (se dividio en
    # assets_backend / assets_frontend). Este SCSS solo aplica al backend.
    "assets": {
        "web.assets_backend": [
            "web_sheet_full_width/static/src/scss/web_sheet_full_width.scss",
        ],
    },
    "installable": True,
}
