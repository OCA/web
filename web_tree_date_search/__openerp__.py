# -*- coding: utf-8 -*-
# © 2015 Thomas Fossoul, Noviat <thomas.fossoul@noviat.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    'name': 'Tree dates search',
    'version': '7.0.3.1.0',
    'author': 'Noviat, Odoo Community Association (OCA)',
    'website': 'http://www.noviat.com',
    'license': 'AGPL-3',
    'category': 'Web',
    'description': """
.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :alt: License
Tree Date Search
================
This module allows you to easily add dates range search fields on top of
tree View rows.

These dates fields can be used in combination with the Search window.
This module requires developer skills to be used.

Usage
=====

Add a new 'dates_filter' key and a list of fields name in the action context:
{'dates_filter': ['start']}
or several dates:
{'dates_filter': ['start','stop',..]}
You can also show the date format widget instead of the datetime format:
{'dates_filter':[['start', 1], 'stop']}
  Put the field_name on a list with a second parameter set to 1: ['field_name', 1]

.. image:: web_tree_date_search/static/src/img/demo.png

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas # noqa: skip 79 char because I can't change the URL
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/162/7.0

Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/web/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smashing it by providing a detailed and welcomed `feedback
<https://github.com/OCA/
web/issues/new?body=module:%20
web_tree_date_search%0Aversion:%20
7.0%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_. # noqa: skip 79 char because I can't change the URL

Credits
=======

Author
------
* Thomas Fossoul, Noviat <thomas.fossoul@noviat.com>

Maintainer
----------
.. image:: https://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: https://odoo-community.org

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose
mission is to support the collaborative development of Odoo features and
promote its widespread use.

To contribute to this module, please visit https://odoo-community.org.
    """,
    'depends': [
        'web',
    ],
    'js': [
        'static/src/js/search.js',
    ],
    'qweb': [
        'static/src/xml/search.xml',
    ],
    'css': [
        'static/src/css/search.css',
    ],
    'demo': [
        'demo/demo.xml',
    ],
    'installable': True,
}
