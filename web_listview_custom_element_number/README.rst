.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

=========================================================================
Allow users to set manually a quantity of items to display in a tree view
=========================================================================

This module extends the functionality of web module, to improve list views and
to allow users to display custom quantity of items.

(By default, in Odoo, user can only display 80 / 200 / 500 / 2000 elements in
a tree view)

Usage
=====

To use this module, you need to:

#. Go to a list view
#. Click on the item '1 - 80 of xxx'
#. Tip a custom quantity of item you want to see, and then press return

Sample for res.partner model with a limit of 3:

.. image:: ./web_listview_custom_element_number/static/src/img/screnshot_partner_limit.png


.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/162/9.0


Technical information
=====================

* Replace a select element by an input with datalist option. That allows
  to set a custom value, or to select an option. (same options as before:
  80 / 200 / 500 / 2000 / unlimited);

* WARNING: 'Datalist' is a HTML5 tag; If your browser is not HTML5
  compliant, the options will not be displayed (but it is possible for
  user to select manually a value);
  See browser Support: http://www.w3schools.com/tags/tag_datalist.asp

* The display of the datalist input can be different depending of the browser.
    * FireFox Display:
    .. image:: ./web_listview_custom_element_number/static/src/img/screnshot_firefox.png
    * Chrome Display:
    .. image:: ./web_listview_custom_element_number/static/src/img/screnshot_chrome.png


Known issues / Roadmap
======================

* When pressing Esc key, it could be user friendly to return to the previous
  state (before editing the quantity).

Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/web/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smash it by providing detailed and welcomed feedback.

Credits
=======

Contributors
------------

* Sylvain LE GAL (https://twitter.com/legalsylvain)

Funders
-------

The development of this module has been financially supported by:

* Akretion (http://www.akretion.com)

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
