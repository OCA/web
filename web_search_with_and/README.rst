.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :alt: License: AGPL-3

Force AND on Search Input
=========================

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

Credits
=======

Contributors
------------

* Andrius Preimantas <andrius@versada.lt>

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
