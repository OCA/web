# Copyright 2023 Komit - Cuong Nguyen Mtm
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "Web Tooltip Field",
    "version": "14.0.1.0.0",
    "summary": "Showing a Field ToolTip in Odoo",
    "category": "Tools",
    "website": "https://github.com/OCA/web",
    "author": "KOMIT, Odoo Community Association (OCA)",
    "maintainers": ["cuongnmtm"],
    "license": "AGPL-3",
    "depends": ["base", "web"],
    "data": [
        "security/ir.model.access.csv",
        "views/ir_model_fields_help_tooltip_view.xml",
    ],
    "post_load": "post_load",
    "application": False,
    "installable": True,
}
