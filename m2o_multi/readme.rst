
Select multi many2one Ids in one2many list
===================

Standard Odoo only support adding one line a time in the one2many list view embedded in form view, for example, when creating a sales order or a purchase
order, user can only select one product a time, this module allows user to select multi product in one go.

Usage
=====
1. in the form view with one2many field tree view, add the attribute multi_select = "1" to the target many2one field, e.g for customer invoice form, the product_id
field is the target many2one field,  <field name="product_id" multi_select = "1"/>
2. in the many2one dropdown list, select search more... button, multi selection is possible, select multi items by tick the check box, then click the select button
all the selected items will be populated to the one2many list , also the onchange and default has been properly handled.

There are no any settings to configure. Just install module and continue to use odoo in a usual way. You will see links to last visited pages.

For further information, please visit:

 * https://www.github.com/szufisher

Known issues / Roadmap
======================

 * FIXME: doesn't work in a res.config view


Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/web/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us smashing it by providing a detailed and welcomed feedback
`here <https://github.com/OCA/web/issues/new?body=module:%20web_last_viewed_records%0Aversion:%208.0%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_.


Credits
=======

Contributors
------------

* Ivan Yelizariev <yelizariev@it-projects.info>

Maintainer
----------

.. image:: http://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: http://odoo-community.org

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose mission is to support the collaborative development of Odoo features and promote its widespread use.

To contribute to this module, please visit http://odoo-community.org.
