{
    "name": "Report Font Size in Document Layout",
    "version": "16.0.1.1.0",
    "summary": "Adds a font size selector (pt) to the Document Layout wizard",
    "author": "Binhex," "Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "LGPL-3",
    "depends": ["web"],
    "data": [
        "views/base_document_layout_views.xml",
        "views/report_templates_inherit.xml",
    ],
    "assets": {
        "web.report_assets_common": [
            "web_font_size_report_layout/static/src/scss/report_font_size.scss"
        ],
        "web.report_assets_pdf": [
            "web_font_size_report_layout/static/src/scss/report_font_size.scss"
        ],
    },
    "installable": True,
}
