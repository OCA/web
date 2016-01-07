.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

==========================
Fix Sequence Functionality
==========================

Using sequence field implies that lines should keep an original order they were
added. However standard functionality does not yield this result.

With this module installed sequence value is based on other sequences in
the same list, which combined with *_order = 'sequence ASC'* allows to retain
ordering of which records were created. 

What this module does:

* Works only for records created in front-end
* Makes sure that new records gets highest or lowest sequence value depending
  on where record is inserted (in case of editable list "top" or "bottom")

What this module doesn't do:

* Does not work for records created from back-end
* It does not ensure that first element has sequence = 1
* It does not check for continues sequence numbering (e.g. sequences like
  1, 2, 5, 8 are possible)
* Does not ensure sequence uniqueness

**Important**: this module might create negative sequence numbers (e.g. in case
of tree view *editable=top*)

**Technical**: The module injects computed sequence into context like so:
*{"default_sequence": <value>}*. This overrides defaults defined in *_defaults* dict. If you still want to provide your own sequence value you can do it by overriding
*default_get()* function.

Usage
=====

* Install this module
* Define new field *sequence = fields.Integer()*
* Add sequence field in desired view (you can hide field with *invisible="1"* if
  needed)
* Ensure ordering with *_order = 'sequence ASC'*

Known issues / Roadmap
======================

* Fix negative sequence numbers
* Ensure continuous sequence numbering

Credits
=======

Contributors
------------

* Andrius Preimantas <andrius@versada.lt>

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
