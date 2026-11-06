# Copyright 2020 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl)
{
    "name": "Generate assets when Odoo starts",
    "summary": "Ensure that assets are generated when Odoo starts.",
    "version": "18.0.1.0.0",
    "category": "Hidden",
    "author": "Camptocamp, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "depends": [
        "web",
    ],
    "website": "https://github.com/OCA/web",
    "data": ["data/ir_cron.xml"],
    "post_load": "post_load_hook",
    "installable": True,
}
