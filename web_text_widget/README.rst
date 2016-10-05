.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :alt: License: AGPL-3

========================
'Web Wwb Limited Widget
========================

* Add new 'text_limited' widget for TextField, but data are limited to
10 lines or 500 characters (by default).

Usage
=====

* You can change default values by context varibles 'limit_lines' and 'limit_chars'.
If data contains more characters or lines, it will be cut.
Example of usage:
<field name="some_text_field"
       widget="text_limited"
       context="{'limit_lines': 8, 'limit_chars': 400}"
/>


Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/web/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smashing it by providing a detailed and welcomed feedback.

Credits
=======


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
