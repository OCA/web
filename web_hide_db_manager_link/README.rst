.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

=============================================
Hide link to database manager in login screen
=============================================

This module hides the "Manage Databases" link at the bottom of login screen.


Installation
============

To install this module, you need to:

 * Go to Settings / Local Modules
 * Search by module name "Hide link to database manager in login screen" or
   by module technical name "*web_hide_db_manager_link*"
 * Click install button

Usage
=====

When this module is installed the link "Manage Databases" will be hidden in
the login screen.

The image in *web_hide_db_manager_link/static/src/img/screen.png* shows the
resulting loging screen.

.. image:: web_hide_db_manager_link/static/src/img/screenshot.png

In order to access to the database management, the administrator should use a
specific URL <myserver>/web/database/manager

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/162/10.0

Known issues
============

* As Odoo v8 templates only live in the database, this module must be
  installed in each database you want this to be in effect.


Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/OCA/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smashing it by providing a detailed and welcomed feedback.


Credits
=======

Contributors
------------

* Alejandro Santana <alejandrosantana@anubia.es>
* Serpent Consulting Services Pvt. Ltd. <jay.vora@serpentcs.com>

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
