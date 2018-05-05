.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :alt: License: AGPL-3

{web_export_streamed}
==============

Allows all rows to be exported from a search view including
the ones not on the current page. Data is streamed back from
the server to prevent timeouts and memory issues when exporting
many records.


Installation
============

The following modules are required

* web

Configuration
=============

No configuration is required

Usage
=====

To use the streaming functionality in this module, select all
rows for CSV export from a list view.

* go to ...

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/162/8.0

For further information, please visit:

* https://www.odoo.com/forum/help-1

Known issues / Roadmap
======================

* Excel files are generated with streamed data but the download will only begin once the entire file is generated

Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/web/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us smashing it by providing a detailed and welcomed feedback
`here <https://github.com/OCA/web/issues/new?body=module:%20web_export_streamed%0Aversion:%208.0%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_.


Credits
=======

Contributors
------------

* Craig Gowing <craig.gowing@credativ.co.uk>

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
