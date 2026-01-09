# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "Web Disable ChatGPT",
    "version": "18.0.1.0.0",
    "license": "AGPL-3",
    "author": "MetricWise, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "category": "Web",
    "depends": ["web_editor"],
    "installable": True,
    "assets": {
        "web.assets_backend": [
            "web_editor_disable_chatgpt/static/src/**",
        ],
        "web.assets_tests": ["web_editor_disable_chatgpt/static/tests/**"],
    },
}
