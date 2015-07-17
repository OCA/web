Allow to write simple mathematic formulas in Integer / Float fields
===================================================================

* Possibility to tip a text like "=45 + 4/3 - 5 * (2 +1)";
* if the formula is correct, The result will be computed and displayed;
* if the formula is not correct, the initial text is displayed;

Technical informations
----------------------

* Overloads "instance.web.form.FieldFloat"; (so works for fields.integer &
  fields.float);
* To compute, the module simply use the eval() javascript function;
* Rounding computation is not done by this module (The module has the same
  behaviour if the user tips "=1/3" or if he tips "0.33[...]");
* avoid code injonction by regexpr test: "=alert('security')" is not valid;

Usage
=====

See demo here Video: http://www.youtube.com/watch?v=jQGdD34WYrA&hd=1

Roadmap / Limit
===============
* Only supports the four operators: "+" "-" "*" "/" and parenthesis;

Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/web/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us smashing it by providing a detailed and welcomed feedback
`here <https://github.com/OCA/web/issues/new?body=module:%20web_widget_float_formula%0Aversion:%208.0%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_.

Credits
=======

Contributors
------------

* Sylvain Le Gal (https://twitter.com/legalsylvain)

Maintainer
----------

.. image:: http://odoo-community.org/logo.png
    :alt: Odoo Community Association
    :target: http://odoo-community.org

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose mission is to support the collaborative development of Odoo features and promote its widespread use.

To contribute to this module, please visit http://odoo-community.org.

