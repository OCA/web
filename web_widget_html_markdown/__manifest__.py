# Copyright 2022 Therp B.V. - <http:///therp.nl>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "Web Widget Html Markdown",
    "version": "14.0.1.0.0",
    "author": "Giovanni Francesco Capalbo, Therp B.V. , "
    "Odoo Community Association (OCA)",
    "category": "Web",
    "license": "AGPL-3",
    "website": "https://github.com/OCA/web",
    "summary": "Widget for Html fields that adds markdown Html undirectional editor",
    "depends": [
        "web",
        "web_editor",
    ],
    "demo": ["demo/bootstrap_markdown.xml"],
    "data": ["views/assets.xml"],
    "qweb": [
        "static/src/xml/radio_info.xml",
    ],
    "installable": True,
    "auto_install": False,
    "application": False,
}
