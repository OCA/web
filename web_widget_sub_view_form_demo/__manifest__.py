{
    "name": "Web Widget Sub View Form Demo",
    "summary": "Demo of sub_view_form: teacher / student partner details",
    "version": "20.0.1.0.0",
    "development_status": "Alpha",
    "category": "Web",
    "website": "https://github.com/OCA/web",
    "author": "Akretion, Odoo Community Association (OCA)",
    "maintainers": [
        "bealdav",
    ],
    "license": "AGPL-3",
    "depends": [
        "web_widget_sub_view_form",
        "contacts",
    ],
    "data": [
        "security/ir.access.csv",
        "views/detail.xml",
        "views/partner.xml",
    ],
    "demo": ["demo/partner.xml"],
}
