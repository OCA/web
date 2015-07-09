Allow users to set manually a quantity of items to display in a tree view
=========================================================================

By default, in Odoo, user can display 80 / 200 / 500 / 2000 elements in
a tree view. With that module, user can select a custom number of items to
display;

Technical information
---------------------

* replace a select element by an input with datalist option. That allows
  to set a custom value, or to select an option. (same options as before:
  80 / 200 / 500 / 2000 / unlimited);

* WARNING: 'Datalist' is a HTML5 tag; If your browser is not HTML5
  compliant, the options will not be displayed (but it is possible for
  user to select manually a value);
  See browser Support: http://www.w3schools.com/tags/tag_datalist.asp


Usage
-----

* Sample for res.partner model with a limit of 3:

.. image:: web_listview_custom_element_number/static/src/img/screnshot_partner_limit.png

The display of the datalist input can be different depending of the browser.

* FireFox Display:

.. image:: web_listview_custom_element_number/static/src/img/screnshot_firefox.png

* Chrome Display:

.. image:: web_listview_custom_element_number/static/src/img/screnshot_chrome.png

Limits / Roadmap
================
* When pressing Esc key, it could be user friendly to return to the previous
  state (before editing the quantity).


Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/web/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us smashing it by providing a detailed and welcomed feedback
`here <https://github.com/OCA/web/issues/new?body=module:%20web_listview_custom_element_number%0Aversion:%208.0%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_.


Credits
=======

Contributors
------------

* Sylvain LE GAL (https://twitter.com/legalsylvain)

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
