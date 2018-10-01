.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

=====================
Tree View Date Search
=====================

This module allow you to easily add date range search fields to tree views.
These date fields can be used in combination with the Search window.

Usage
=====

Add a new 'dates_filter' key and a list of field names in the action context:

.. code:: python

 {'dates_filter': ['start']}

or several dates:

.. code:: python

 {'dates_filter': ['start','stop',..]}

Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/web/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us smashing it by providing a detailed and
welcomed feedback `here <https://github.com/OCA/web/issues/new?body=module:%20 web_tree_date_search%0Aversion:%208.0%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`__.

Credits
=======

Images
------

* PICOL Icon Generator `here <http://picol.org/picol_icon_generator>`__.

Contributors
------------

* Tom Blauwendraat <tom@sunflowerweb.nl>
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

To contribute to this module, please visit http://odoo-community.org.
