{
    "name": "Web List Record Popup",
    "version": "18.0.1.0.0",
    "category": "Hidden",
    "license": "LGPL-3",
    "author": "Akretion, Odoo Community Association (OCA)",
    "maintainers": ["rvalyi"],
    "website": "https://github.com/OCA/web",
    "depends": ["web"],
    "data": [],
    "assets": {
        "web.assets_backend": [
            "web_list_record_popup/static/src/js/list_renderer_with_button.esm.js",
        ],
        "web.assets_unit_tests": [
            "web_list_record_popup/static/tests/list_renderer_with_button.test.js",
        ],
    },
}
