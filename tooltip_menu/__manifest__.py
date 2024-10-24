{
    "name": "Showing a Menu ToolTip in Odoo",
    "summary": """
        Showing a Menu ToolTip in Odoo
        """,
    "author": "Moltis Technologies, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "category": "Tools",
    "version": "14.0.1.0.0",
    "depends": ["base", "web"],
    "data": [
        "views/action_view.xml",
        "views/template.xml",
    ],
    "qweb": [
        "static/src/xml/menu.xml",
    ],
    "images": ["static/description/banner.png"],
    "license": "GPL-3",
    "application": True,
    "installable": True,
}
