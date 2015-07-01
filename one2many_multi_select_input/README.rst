.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :alt: License: AGPL-3

Multi select input for one2many
===========

Standard odoo does support selecting multiple items(objects) for many2many field, there is other module implementing
similiar function via server side wizard and active_id, which have 2 usability limitations. there will be a popup window for the wizard form, from there user need to select multi items, then click the apply button in the popup wizard form to return back the original one2many list view 2. after the selection done, the one2many items already written to DB, there is no way to discard the changes.
this module is purely client side JS module, just adapted the standard many2many popup selection modal dialog to one2many

Installation
============

nothing special

Configuration
=============

To use this module, you need to:

no special configuration needed

Usage
=====

To use this module, you need to:

* modify the target form view with one2many field, add <a> element bebween the one2many field and the open tree tag followed, e.g :<a class="multi_select button oe_edit_only" href="#">Add Multi ...</a>

* modify the JS to adapt to your modle (fields)

For further information, please visit:

* https://www.odoo.com/forum/help-1

Known issues / Roadmap
======================

*  to activate this function, each form need to be adapted as above, in the future, maybe it can be made as generic
so no special handling for each form view needed.

Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/{project_repo}/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us smashing it by providing a detailed and welcomed feedback
`here <https://github.com/OCA/{project_repo}/issues/new?body=module:%20{module_name}%0Aversion:%20{version}%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_.


Credits
=======

Contributors
------------

* Fisher Yu <szufisher@gmail.com>

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
