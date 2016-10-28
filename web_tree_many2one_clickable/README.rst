.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

========================================
Clickable many2one fields for tree views
========================================

This addon provides a separate widget to allow many2one or reference fields in
a tree view open the linked resource when clicking on their name.

You can also define a system parameter to have this behaviour for all the
existing many2one fields in tree views.

Installation
============

Install it the regular way.

Configuration
=============

After installation, all many2one and reference fields will be clickable
by default. You can change this in *Configuration > Technical > Parameters > System parameters*,
parameter with name `web_tree_many2one_clickable.default` setting it to `false`.

Usage
=====

For the widget option, you need to add `widget="many2one_clickable"` attribute
in the XML field definition in the tree view.

For example:

`<field name="partner_id" widget="many2one_clickable" />`

will open the linked partner in a form view.

If system parameter `web_tree_many2one_clickable.default` is `true` and you
need to disable one field, then use `widget="many2one_unclickable"`

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/162/9.0


Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/web/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smashing it by providing a detailed and welcomed feedback.


Credits
=======

Contributors
------------

* Therp BV
* Pedro M. Baeza <pedro.baeza@serviciosbaeza.com>
* Antonio Espinosa <antonio.espinosa@tecnativa.com>

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
