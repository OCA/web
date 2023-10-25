{
    "name": "Web Widget UoM",
    "summary": """Allow user to to decide how many decimal places should be displayed for UoM.
    """,
    "category": "web",
    "version": "14.0.1.0.0",
    "author": "Odoo Community Association (OCA), Giovanni Serra",
    "license": "AGPL-3",
    "website": "https://github.com/OCA/web",
    "depends": ["web", "uom", "product"],
    "data": [
        "views/uom_uom_views.xml",
        "views/assets.xml",
    ],
    "auto_install": False,
    "application": False,
    "installable": True,
    "web_preload": True,
}
