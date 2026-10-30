{
    "name": "Navbar Apps Menu Icon",
    "summary": "Display each application's icon in the apps dropdown menu",
    "version": "20.0.1.0.0",
    "category": "Technical",
    "license": "LGPL-3",
    "author": "Akretion, Odoo Community Association (OCA)",
    "depends": ["web"],
    "maintainers": ["bealdav"],
    "website": "https://github.com/OCA/web",
    "assets": {
        "web.assets_backend": [
            "web_navbar_icon/static/src/webclient/navbar/navbar_patch.xml",
            "web_navbar_icon/static/src/webclient/navbar/navbar_patch.scss",
        ],
    },
    "installable": True,
}
