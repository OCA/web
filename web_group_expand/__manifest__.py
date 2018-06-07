{
    "name": "Group Expand Buttons",
    'summary': """
        Enables expanding/reset all groups in list view
    """,
    "version": "11.0.1.0.1",
    "category": "Web",
    "author": "OpenERP SA, "
              "AvanzOSC, "
              "Serv. Tecnol. Avanzados - Pedro M. Baeza, "
              "Odoo Community Association (OCA)",
    "website": "https://github.com/oca/web",
    'license': 'AGPL-3',
    "depends": [
        "web"
    ],
    "data": [
        "templates/assets.xml",
    ],
    "qweb": [
        "static/src/xml/web_group_expand.xml",
    ],
    "installable": True,
    'application': False,
}
