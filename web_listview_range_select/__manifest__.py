{
    "name": "List Range Selection",
    "summary": """
        Enables selecting a range of records using the shift key
    """,
    "version": "16.0.1.0.0",
    "category": "Web",
    "author": "Onestein, Synodica Solutions Pvt. Ltd., Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "depends": ["web"],
    "installable": True,
    "application": False,
    "assets": {
        "web.assets_backend": [
            "web_listview_range_select/static/src/js/web_listview_range_select.esm.js",
            "web_listview_range_select/static/src/xml/web_listview_range_select.xml",
        ],
    },
}
