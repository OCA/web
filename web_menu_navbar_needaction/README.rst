.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :alt: License: AGPL-3
================================
Needaction counters in main menu
================================

This module shows the sum of all submenus' needaction counters in main menus. This way, users get visual feedback where there's still work to do without having to open the respective menu beforehand.

The counters are updated periodically, so users will also be notified if there are new records that require attention.

Configuration
=============

To configure the update frequency, set the configuration parameter `web_menu_navbar_needaction.refresh_timeout` to the amount of milliseconds after which the counters should be updated. Don't do this too often, as this will cause a lot of queries to the database. The default it 600000, which is equivalent to 10 minutes.

To disable updates, set the parameter to 0.

For more fine-grained control over the menus, you can turn off needaction for a menu by setting its field `needaction` to `False`, or in case you need a different needaction domain, set `needaction_domain` on the menuitem to the domain you need.

Usage
=====

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
    :alt: Try me on Runbot
    :target: https://runbot.odoo-community.org/runbot/162/8.0

For further information, please visit:

* https://www.odoo.com/forum/help-1

Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/web/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us smashing it by providing a detailed and welcomed feedback
`here <https://github.com/OCA/web/issues/new?body=module:%20web_menu_navbar_needaction%0Aversion:%208.0%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_.

Credits
=======

Contributors
------------

* Holger Brunn <hbrunn@therp.nl>

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
