{
    "name": "Web Live Price Formatter",
    "version": "18.0.1.0.0",
    "category": "Web",
    "summary": "Format price fields with thousands separators in real time",
    "license": "LGPL-3",
    "author": "Odoo Community Association (OCA), Fouad Salehi",
    "website": "https://github.com/OCA/web",
    "depends": ["sale"],
    "assets": {
        "web.assets_backend": [
            "web_live_price_formatter/static/src/js/unit_price_format.js",
        ],
    },
    "installable": True,
    "application": False,
}
