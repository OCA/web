# Copyright (C) 2023 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "Web - Merge Notebook Tabs",
    "summary": "Merge many tabs into a single one, for notebook present"
    " in form views of any models",
    "version": "16.0.1.0.0",
    "author": "GRAP, Odoo Community Association (OCA)",
    "maintainers": ["legalsylvain"],
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "category": "Extra Tools",
    "depends": ["web"],
    "data": [
        "views/view_ir_ui_view_merge_notebook_tab.xml",
        "security/ir.model.access.csv",
    ],
    # "demo": ["demo/demo_ir_ui_view_merge_notebook_tab.xml"],
    "installable": True,
    "application": True,
}
