# -*- coding: utf-8 -*-
# Copyright 2018 Bejaoui Souheil <souheil_bejaoui@hotmail.fr>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "Add Description to filters",
    "version": "10.0.1.0.0",
    "author": "Bejaoui Souheil, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    'website': "https://github.com/OCA/web",
    "summary": "Add description to filters",
    "category": "Tools",
    "depends": ['web'],
    "data": ["views/assets.xml", "views/ir_filters.xml"],
    'qweb': ["static/src/xml/web_filter_description.xml"],
    "installable": True,
}
