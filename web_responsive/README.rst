.. image:: https://img.shields.io/badge/license-LGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/lgpl-3.0-standalone.html
   :alt: License: LGPL-3

==============
Web Responsive
==============

This module provides a mobile compliant interface for Odoo Community web.

Features:

 * New navigation with an App drawer
 * Keyboard shortcuts for easier navigation
 * Display kanban views for small screens if an action or field One2x


Installation
============

Configuration
=============

Usage
=====

Keyboard Shortcuts
------------------

The following keyboard shortcuts are implemented:

* Toggle App Drawer - `ActionKey <https://en.wikipedia.org/wiki/Access_key#Access_in_different_browsers>` + ``A``
* Navigate Apps Drawer - Arrow Keys
* Type to select App Links
* ``esc`` to close App Drawer

Quick Search
------------

A search feature is provided in the App Drawer, which allow for you to easily
navigate menus without a mouse.

To activate the search, just begin typing while within the App Drawer.

You can use the arrow keys or mouse to navigate and select results, in a similar
fashion to navigating the apps in the drawer.

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/162/10.0

Known issues / Roadmap
======================

Note: Data added to the footer ``support_branding`` is not shown while using
this module.

* Drag drawer from left to open in mobile
* Figure out how to test focus on hidden elements for keyboard nav tests
* Override LESS styling to allow for responsive widget layouts
* Adding ``oe_main_menu_navbar`` ID to the top navigation bar triggers some
  great styles, but also `JavaScript that causes issues on mobile
  <https://github.com/OCA/web/pull/446#issuecomment-254827880>`_
* The ``AppDrawer`` JavaScript object currently extends ``Class``. We should extend
  ``Widget`` instead.
* On Android (FireFox) - clicking the search icon does not focus the search input.
* On Android (FireFox & Chrome) - clicking the search query input will show the on
  screen keyboard for a split second, but the App Drawer immediately closes and the
  keyboard closes with it.

Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/web/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smashing it by providing a detailed and welcomed feedback.


Credits
=======

Images
------

* Odoo Community Association: `Icon <https://github.com/OCA/maintainer-tools/blob/master/template/module/static/description/icon.svg>`_.

Contributors
------------

* Dave Lasley <dave@laslabs.com>
* Jairo Llopis <jairo.llopis@tecnativa.com>
* Dennis Sluijk <d.sluijk@onestein.nl>
* Sergio Teruel <sergio.teruel@tecnativa.com>
* Serpent Consulting Services Pvt. Ltd.<jay.vora@serpentcs.com>

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
