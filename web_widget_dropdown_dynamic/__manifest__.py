# Copyright 2019-2020 Brainbean Apps (https://brainbeanapps.com)
# Copyright 2020 CorporateHub (https://corporatehub.eu)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).
{
    "name": "Dynamic Dropdown Widget",
    "summary": "This module adds support for dynamic dropdown widget",
    "category": "Web",
    "version": "18.0.1.0.0",
    "license": "AGPL-3",
    "author": "CorporateHub, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "depends": ["web"],
    "installable": True,
    "assets": {
        "web.assets_backend": [
            "web_widget_dropdown_dynamic/static/src/js/field_dynamic_dropdown.esm.js",
        ],
        "web.qunit_suite_tests": [
            "web_widget_dropdown_dynamic/static/tests/web_widget_dropdown_dynamic_tests.esm.js",
        ],
    },
    "demo": [
        "demo/ir_model_fields.xml",
        "demo/ir_filters_view.xml",
    ],
}
