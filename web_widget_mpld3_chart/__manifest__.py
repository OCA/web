# Copyright 2020 ForgeFlow, S.L.
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

{
    "name": "Web Widget mpld3 Chart",
    "category": "Hidden",
    "summary": "This widget allows to display charts using MPLD3 library.",
    "author": "ForgeFlow, Odoo Community Association (OCA)",
    "version": "14.0.1.0.0",
    "website": "https://github.com/OCA/web",
    "depends": ["web"],
    "data": ["views/web_widget_mpld3_chart.xml"],
    "external_dependencies": {"python": ["mpld3"]},
    "auto_install": False,
    "license": "LGPL-3",
}
