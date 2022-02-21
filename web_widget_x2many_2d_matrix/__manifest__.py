# Copyright 2015 Holger Brunn <hbrunn@therp.nl>
# Copyright 2016 Pedro M. Baeza <pedro.baeza@tecnativa.com>
# Copyright 2018 Simone Orsi <simone.orsi@camptocamp.com>
# Copyright 2020 CorporateHub (https://corporatehub.eu)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
{
    "name": "2D matrix for x2many fields",
    "version": "15.0.1.0.1",
    "maintainers": ["ChrisOForgeFlow"],
    "development_status": "Production/Stable",
    "author": (
        "Therp BV, "
        "Tecnativa, "
        "Camptocamp, "
        "CorporateHub, "
        "Odoo Community Association (OCA)"
    ),
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "category": "Hidden/Dependency",
    "summary": "Show list fields as a matrix",
    "depends": ["web"],
    "data": [],
    "installable": True,
    "assets": {
        "web.assets_backend": [
            "web_widget_x2many_2d_matrix/static/src/scss/web_widget_x2many_2d_matrix.scss",
            "web_widget_x2many_2d_matrix/static/src/js/2d_matrix_renderer.js",
            "web_widget_x2many_2d_matrix/static/src/js/2d_matrix_view.js",
            "web_widget_x2many_2d_matrix/static/src/js/abstract_view_matrix_limit_extend.js",
            "web_widget_x2many_2d_matrix/static/src/js/widget_x2many_2d_matrix.js",
        ],
    },
}
