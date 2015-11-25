.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :alt: License

Tree Date Search
==============================

This module allow you to easily add dates range search fields on top of List View rows.

These dates fields can be used in combination with the Search window.

How to do ?

Add a new 'dates_filter' key and a list of fields name in the action context:
{'dates_filter': ['start']}
or several dates:
{'dates_filter': ['start','stop',..]}

.. image:: web_tree_date_search/static/src/img/demo.png
.. image:: web_tree_date_search/static/src/img/demo1.png

Credits
=======

Author
------
* Thomas Fossoul, Noviat <thomas.fossoul@noviat.com>

Maintainer
----------
.. image:: http://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: http://odoo-community.org

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose
mission is to support the collaborative development of Odoo features and
promote its widespread use.

To contribute to this module, please visit http://odoo-community.org.
