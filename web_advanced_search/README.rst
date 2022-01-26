.. image:: https://img.shields.io/badge/license-LGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/lgpl-3.0-standalone.html
   :alt: License: LGPL-3

=========================================
Search for x2x records in advanced search
=========================================

Standard behavior in advanced search for one2many, many2many and many2one fields is to do a `name_search`. This often is not satisfactionary as you might want to search for other properties. There might also be cases where you don't exactly know what you're searching for, then a list of possible options is necessary too. This module enables you to have a full search view to select the record in question, and either select specific records or select them using a search query of its own.

Usage
=====

To use this module, you need to:

* open the advanced search options in a search view
* select a one2many, many2many or many2one field
* select operator `is equal to` or `is not equal to`
* the textfield changes to a many2one selection field where you can search for the record in question
* click *Apply*

To search for properties of linked records (ie invoices for customers with a credit limit higher than X):

* open the advanced search options in a search view
* select a one2many, many2many or many2one field
* select operator `is in selection`
* in the search view that pops up, select the criteria
* select the records you want, or select the top corner box to select all matching records with that criteria
* click *Select*

Note that you can stack searching for properties: Simply add another advanced search in the selection search window. You can do this indefinetely, so it is possible to search for moves belonging to a journal which has a user who is member of a certain group etc.

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/162/10.0

Known issues / Roadmap
======================

* When you use *is in selection* search system and choose a domain, it gets
  immediately applied, so to add a new condition, you will have to use again
  the *Filters* menu.

Credits
=======

Contributors
------------

* Holger Brunn <hbrunn@therp.nl>
* Vicent Cubells <vicent.cubells@tecnativa.com>
* Jairo Llopis <jairo.llopis@tecnativa.com>
* Rami Alwafaie <rami.alwafaie@initos.com>

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
