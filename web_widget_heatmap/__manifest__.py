# Copyright 2019 Dinar Gabbasov <https://it-projects.info/team/GabbasovDinar>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "Web Widget HeatMap",
    "summary": "Displaying your records in calendar HeatMap",
    "version": "11.0.1.0.0",
    "development_status": "Stable",
    "category": "Extra Tools",
    "website": "https://github.com/OCA/web/tree/11.0/web_widget_heatmap",
    "author": "Dinar Gabbasov, Odoo Community Association (OCA)",
    "maintainers": ["GabbasovDinar"],
    "license": "AGPL-3",
    "application": False,
    "installable": True,
    "preloadable": True,
    "external_dependencies": {
        "python": [],
        "bin": [],
    },
    "depends": [
        "web",
    ],
    "data": [
        "views/web_widget_heatmap_template.xml",
    ],
    "demo": [],
    "qweb": [
        "static/src/xml/base.xml"
    ]
}
