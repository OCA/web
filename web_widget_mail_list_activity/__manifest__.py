# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "Web List Activity Widget (Backport)",
    "version": "12.0.1.0.0",
    "author": "Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "category": "Web",
    "website": "https://github.com/OCA/web",
    'installable': True,
    "depends": [
        "web",
        "mail",
    ],
    "data": ["views/web_widget_mail_list_activity_assets.xml", ],
    'qweb': ['static/src/xml/web_widget_mail_list_activity.xml', ],
}
