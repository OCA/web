.. image:: https://img.shields.io/badge/license-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

=================
Web Stock Picking
=================

This module provides a website frontend for stock pickings.

It is designed to be particularly useful with a mobile device and barcode
scanner.

Installation
============

* Install Module

Configuration
=============

* You must set a Barcode Nomenclature on any Stock Picking Type that will
  utilize the barcode integration

Usage
=====

* Go to Inventory => Mobile/Barcode
* Choose a picking, or refine search
* Utilize picking form in similar fashion as backend form

Picking form also contains a barcode listener interface, and will increment/decrement
quantities based on scanned barcodes. It currently supports the following nomenclature
types:

* Product
* Lot

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/154/9.0

Known issues / Roadmap
======================

* Properly handle permissions in view
* Support for lot scanning is at the unit level only. The lots themselves are not bound
  to the picking in any way
* Implement proper errors instead of alerts - requires keybindings for enter/cancel
* Implement commented out view actions
* It would be nice to also allow for a BarcodeScanner device, instead of just the
  element events
* Button injection in stock.picking.type Kanban fails silently (have also tried jQuery
  template injection)

Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/{project_repo}/issues>`_. In case of trouble, please
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
