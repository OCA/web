# -*- coding: utf-8 -*-
# This file is part of OpenERP. The COPYRIGHT file at the top level of
# this module contains the full copyright notices and license terms.

{
    'name': "Use AND conditions on omnibar search",
    'version': '1.0',
    'author': 'Versada UAB, Odoo Community Association (OCA)',
    'category': 'web',
    'website': 'http://www.versada.lt',
    'description': """
When searching for records on same field Odoo joins multiple queries with OR.
For example:

* Perform a search for customer "John" on field Name
* Odoo displays customers containing "John"
* Search for "Smith" on same field Name
* Odoo displays customers containing "John" OR "Smith"

With this module installed you can press Shift key before searching for "Smith"
and Odoo finds customers containing "John" AND "Smith"

Usage
=====

* Enter your value in Search Input field
* Press and hold Shift key
* Select field with mouse or keyboard to perform search on
    """,
    'depends': [
        'web',
    ],
    'data': [
        'data.xml',
    ],
    'installable': True,
    'application': False,
}
