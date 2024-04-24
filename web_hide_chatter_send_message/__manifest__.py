# Copyright 2024 Therp BV <https://therp.nl>.
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "Web Hide Chatter Send Message",
    "version": "16.0.1.0.0",
    "author": "Therp BV, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "summary": "Hide 'Send message' button on chatter",
    "category": "Tools",
    "depends": ["mail", "web"],
    "assets": {
        "web.assets_backend": [
            "web_hide_chatter_send_message/static/src/"
            "components/chatter_topbar/chatter_topbar.xml",
        ],
    },
    "installable": True,
}
