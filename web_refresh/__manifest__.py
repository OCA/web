# Copyright 2021 Sergey Shebanin
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

{
    "name": "Web Refresh",
    "summary": """
        Refresh current view button.
        "Refresh every N secs" and "Refresh on server changes" modes.""",
    "version": "14.0.1.0.0",
    "category": "Usability",
    "website": "https://github.com/OCA/web",
    "author": "Sergey Shebanin, " "Odoo Community Association (OCA)",
    "license": "LGPL-3",
    "installable": True,
    "depends": [
        "web",
        "base_setup",
        "bus",
    ],
    #    "development_status": "Production/Stable", # Still Beta
    "maintainers": ["SplashS"],
    "data": [
        "views/assets.xml",
        "views/res_config_settings_views.xml",
        "data/web_refresh_data.xml",
    ],
    "qweb": [
        "static/src/components/web_refresh.xml",
        "static/src/components/custom_menuitem.xml",
    ],
}
