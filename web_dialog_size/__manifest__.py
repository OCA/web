# Copyright 2015 ACSONE SA/NV
# Copyright 2018 Amaris
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Web Dialog Size",
    "summary": """
        A module that lets the user expand a
        dialog box to the full screen width.""",
    "author": "ACSONE SA/NV, "
    "Therp BV, "
    "Siddharth Bhalgami,"
    "Tecnativa, "
    "Amaris, "
    "Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "category": "web",
    "version": "18.0.1.0.0",
    "license": "AGPL-3",
    "depends": ["web"],
    "installable": True,
    "assets": {
        "web.assets_backend": [
            "/web_dialog_size/static/src/js/web_dialog_size.esm.js",
            "/web_dialog_size/static/src/scss/web_dialog_size.scss",
            "/web_dialog_size/static/src/xml/ExpandButton.xml",
            (
                "after",
                "/web/static/src/core/dialog/dialog.xml",
                "/web_dialog_size/static/src/xml/web_dialog_header.xml",
            ),
            (
                "after",
                "/web/static/src/views/view_dialogs/select_create_dialog.xml",
                "/web_dialog_size/static/src/xml/select_create_dialog.xml",
            ),
        ],
    },
}
