.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
    :alt: License: AGPL-3

=========================
Web Action Conditionable
=========================

This module was written to extend the functionality of actions in tree views.
Odoo by default support:

::

   <tree delete="false" create="false">

with this module you can:

::
   
   <tree delete="state=='draft'">
or ::

   <tree create="state in ('draft', 'confirm')">

It works in any tree view, so you can use it in One2many.


Installation
============

To install this module, just follow basic steps to install an odoo module.


Configuration
=============

Not needed.

Usage
=====

To use this module, you need to:

* go to ...

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/web/7.0


Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/web/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us smashing it by providing a detailed and welcomed feedback
`here <https://github.com/OCA/web/issues/new?body=module:web_action_conditionableversion:%208.0%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_.


Credits
=======

Contributors
------------

* Cristian Salamea <cristian.salamea@gmail.com>
* Clovis Nzouendjou <clovis@anybox.fr>

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
