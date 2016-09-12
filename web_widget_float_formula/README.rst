.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

========================
Formulas in Float Fields
========================

This module allows the use of simple math formulas in integer/float fields 
(e.g. "=45 + 4/3 - 5 * (2 + 1)").

* Only supports parentheses, decimal points, thousands separators, and the 
  operators "+", "-", "*", and "/"
* Will use the decimal point and thousands separator characters associated 
  with your language
* If the formula is valid, the result will be computed and displayed, and the 
  formula will be stored for editing
* If the formula is not valid, it's retained in the field as text

**Technical Details**

* Overloads web.form_widgets.FieldFloat (so it works for fields.integer & 
  fields.float)
* Uses the eval() JS function to evaluate the formula
* Does not do any rounding (this is handled elsewhere)
* Avoids code injection by applying strict regex to formula prior to eval() 
  (e.g. "=alert('security')" would not get evaluated)

Installation
============

To install this module, simply follow the standard install process.

Configuration
=============

No configuration is needed or possible.

Usage
=====

Install and enjoy. A short demo video can be found at 
http://www.youtube.com/watch?v=jQGdD34WYrA.

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/162/9.0

Known Issues / Roadmap
======================

Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/web/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us smash it by providing detailed and welcomed 
feedback.

Credits
=======

Contributors
------------

* Sylvain Le Gal (https://twitter.com/legalsylvain)
* Oleg Bulkin <o.bulkin@gmail.com>

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
