# Copyright 2015 0k.io
# Copyright 2016 ACSONE SA/NV
# Copyright 2017 Tecnativa
# Copyright 2020 initOS GmbH.
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "web_m2x_options",
    "version": "20.0.1.0.0",
    "category": "Web",
    "author": "initOS GmbH,"
    "ACSONE SA/NV, "
    "0k.io, "
    "Tecnativa, "
    "Sygel, "
    "Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    # This dependency should be replaced by "web" if this commit is merged:
    # https://github.com/odoo/odoo/pull/287582/changes/20771f34cad87b1753a7ab81e5fc172663591c89
    "depends": ["html_editor"],
    "assets": {
        "web.assets_backend": [
            (
                "after",
                "web/static/src/views/fields/standard_field_props.js",
                "web_m2x_options/static/src/views/fields/standard_field_props.esm.js",
            ),
            (
                "before",
                "web/static/src/views/fields/*",
                "web_m2x_options/static/src/utils.esm.js",
            ),
            (
                "before",
                "web/static/src/views/fields/*",
                "web_m2x_options/static/src/views/fields/**",
            ),
            "web_m2x_options/static/src/views/form/form_controller.esm.js",
            "web_m2x_options/static/src/core/autocomplete/autocomplete.xml",
        ],
        "web.assets_unit_tests": [
            "web_m2x_options/static/tests/**/*",
        ],
    },
    "installable": True,
}
