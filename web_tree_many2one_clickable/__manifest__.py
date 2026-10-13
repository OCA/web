# Copyright 2013 Therp BV (<http://therp.nl>).
# Copyright 2015 Pedro M. Baeza <pedro.baeza@serviciosbaeza.com>
# Copyright 2015 Antonio Espinosa <antonio.espinosa@tecnativa.com>
# Copyright 2017 Sodexis <dev@sodexis.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Clickable many2one fields for tree views",
    "summary": "Open the linked resource when clicking on their name",
    "version": "19.0.1.0.0",
    "category": "Hidden",
    "website": "https://github.com/OCA/web",
    "author": "Therp BV, "
    "Tecnativa, "
    "Camptocamp, "
    "Onestein, "
    "Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "installable": True,
    "depends": ["web"],
    "data": [],
    "assets": {
        "web.assets_backend": [
            "web_tree_many2one_clickable/static/src/components/"
            "many2one_button/many2one_button.esm.js",
            "web_tree_many2one_clickable/static/src/components/"
            "many2one_button/many2one_button.scss",
            # Load right after the list renderer templates so the extension is
            # inherited by list renderers that use their own primary record row
            # template, such as the section and note lists of invoice, sale and
            # purchase lines
            (
                "after",
                "web/static/src/views/list/list_renderer.xml",
                "web_tree_many2one_clickable/static/src/components/"
                "many2one_button/many2one_button.xml",
            ),
        ]
    },
}
