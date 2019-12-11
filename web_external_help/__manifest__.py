# Copyright 2019 - TODAY Serpent Consulting Services Pvt. Ltd.
# (<http://www.serpentcs.com>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "Web External Help",
    "version": "13.0.1.0.0",
    "author": "Serpent Consulting Services Pvt. Ltd., "
    "Odoo Community Association (OCA)",
    "category": "Web",
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "depends": ["web"],
    "data": [
        "security/ir.model.access.csv",
        "views/template.xml",
        "views/view_fields_external_help.xml",
        "views/view_model_external_help.xml",
    ],
    "qweb": ["static/src/xml/debug_menu.xml"],
    "auto_install": False,
    "installable": True,
}
