{
    "name": "X2Many inline search (form sub-list)",
    "version": "19.0.1.0.0",
    "category": "Hidden/Technical",
    "summary": "Optional quick search for x2many embedded list in form views",
    "author": "Felix Coca, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "LGPL-3",
    "depends": ["web"],
    "assets": {
        "web.assets_backend": [
            "web_x2many_searchable/static/src/js/**/*.js",
            "web_x2many_searchable/static/src/xml/**/*.xml",
        ],
        "web.qunit_suite_tests": [
            "web_x2many_searchable/static/tests/**/*.test.js",
        ],
    },
    "installable": True,
    "application": False,
}
