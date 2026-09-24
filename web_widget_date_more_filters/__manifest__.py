# Copyright OpenStudio 2024
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
{
    "name": "Web date widget more filters",
    "category": "web",
    "version": "16.0.1.0.0",
    "website": "https://github.com/OCA/web",
    "author": "Elise Gigot <egigot@openstudio.fr>, Odoo Community Association (OCA)",
    "depends": ["web"],
    "summary": "Add some filters to the date filters widget",
    "license": "AGPL-3",
    "installable": True,
    "assets": {
        "web.assets_backend": [
            "web_widget_date_more_filters/static/src/js/web_widget_date_more_filters.esm.js",
        ],
        "web.qunit_suite_tests": [
            "web_widget_date_more_filters/static/tests/widget_filter_menu_tests.esm.js",
        ],
    },
}
