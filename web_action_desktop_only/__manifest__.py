{
    "name": "Web Action Desktop Only",
    "summary": "Restrict visibility of specific actions to desktop devices only",
    "version": "17.0.1.0.0",
    "category": "Web",
    "website": "https://github.com/OCA/web",
    "author": "Heligrafics, Odoo Community Association (OCA)",
    "license": "LGPL-3",
    "maintainers": ["sersanchus"],
    "depends": ["base", "web"],
    "data": [
        "views/ir_actions_views.xml",
    ],
    "assets": {
        "web.assets_backend": [
            "web_action_desktop_only/static/src/js/web_action_desktop_only.esm.js",
        ],
    },
    "installable": True,
}
