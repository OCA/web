# © 2024 initOS GmbH
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Web Assets Manager",
    "version": "15.0.1.0.0",
    "category": "Hidden",
    "author": "initOS GmbH, Nitrokey GmbH, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "summary": """
        Odoo uses a few bundles for web assets which can grow quite large with
        more and more modules in use. This reduces SEO rankings for static pages
        because a lot of not necessary code is being loaded by the clients.

        This module allows to control a bit further which file of the bundles is
        delivered for specific pages.
    """,
    "depends": [
        "web",
        "website",
    ],
    "data": [
        "security/ir.model.access.csv",
        "views/web_assets_views.xml",
        "wizards/assets_wizard_views.xml",
    ],
    "installable": True,
}
