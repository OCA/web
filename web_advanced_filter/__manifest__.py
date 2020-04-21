# Copyright 2014 Therp BV <https://therp.nl>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).
{
    "name": "Advanced filters",
    "version": "12.0.1.0.0",
    "author": "Therp BV,Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "complexity": "normal",
    "summary": "Set operations on filter results",
    "category": "Tools",
    "depends": [
        'web',
    ],
    "qweb": [
        "static/src/xml/web_advanced_filter.xml",
    ],
    "data": [
        "wizards/ir_filters_combine_with_existing.xml",
        "views/ir_filters.xml",
        "views/templates.xml",
    ],
    "pre_init_hook": "pre_init_hook",
    "uninstall_hook": "uninstall_hook",
}
