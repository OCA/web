# -*- coding: utf-8 -*-
# Copyright 2015-2018 Therp BV <http://therp.nl>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "Prefetch autocomplete offers",
    "version": "10.0.1.0.0",
    "author": "Therp BV,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "category": "Usability",
    "summary": "Offer only items on autocompletion that will yield results",
    "depends": [
        'web',
    ],
    "images": [
        'images/web_search_autocomplete_prefetch.png',
    ],
    "data": [
        'views/templates.xml',
        'views/base_view.xml',
    ],
    "installable": True,
}
