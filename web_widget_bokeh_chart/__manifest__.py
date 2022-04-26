# Copyright 2017 ForgeFlow S.L.
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

{
    "name": "Web Widget Bokeh Chart",
    "category": "Hidden",
    "summary": "This widget allows to display charts using Bokeh library.",
    "author": "ForgeFlow, " "Odoo Community Association (OCA)",
    "version": "15.0.1.1.1",
    "maintainers": ["LoisRForgeFlow", "ChrisOForgeFlow"],
    "development_status": "Production/Stable",
    "website": "https://github.com/OCA/web",
    "depends": ["web"],
    "data": [],
    "external_dependencies": {"python": ["bokeh==2.4.2"]},
    "auto_install": False,
    "license": "LGPL-3",
    "assets": {
        "web.assets_backend": [
            "web_widget_bokeh_chart/static/src/js/web_widget_bokeh_chart.esm.js",
        ],
    },
}
