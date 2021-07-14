# Copyright 2012-2015 Therp BV (<http://therp.nl>)
# Copyright 2016 - Tecnativa - Angel Moya <odoo@tecnativa.com>
# Copyright 2017 - redO2oo   - Robert Rottermann <robert@redO2oo.ch>
# Copyright 2021 Sunflower IT (<https://www.sunflowerweb.nl>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Support Branding",
    "summary": "Adds your branding to an Odoo instance",
    "category": "Hidden/Tools",
    "version": "14.0.1.0.0",
    "license": "AGPL-3",
    "author": "Therp BV,Sunflower IT,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "depends": ["web", "base_setup"],
    "qweb": [
        "static/src/xml/base.xml",
    ],
    "data": ["views/asset.xml", "views/res_config_settings.xml"],
    "demo": [
        "demo/ir_config_parameter_data.xml",
    ],
    "installable": True,
}
