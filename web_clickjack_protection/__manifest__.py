# Copyright 2021 Sunflower IT <https://www.sunflowerweb.nl>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).
{
    "name": "Web Clickjack Protection",
    "version": "11.0.1.0.0",
    "author": "Sunflower IT,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "category": "Usability",
    "summary": "Protects Odoo instancess from possible Clickjacking attacks",
    "depends": ["web"],
    "data": ["views/web_assets.xml"],
    "installable": True,
    "auto_install": False,
}
