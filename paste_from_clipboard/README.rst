.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :alt: License: AGPL-3

Paste Multi Line Items from Excel into one2many list
===========

Standard odoo does not support copy multi lines from excel and then paste directly into one2many list in the form view
this function will be very handy if line item data is already available in Excel or can be prepared easily in Excel. instead
of input line by line.

Installation
============

To install this module, you need to:

Just install this moduel as normal. 

Configuration
=============

To use this module, you need to:

no special configuration needed

Usage
=====

To use this module, you need to:

* modify the target form view with one2many field, add textarea element with 2 special attributes
class='textarea' name='one2manyfield', e.g, in the my current timesheet, 
<div class='oe_edit_only'><textarea class='textarea' name='timesheet_ids' placeholder='copy the line items here'/></div>
preferrably elements can be added after the target page </page>, then the textarea will be placed under the summary line

* in Excel file, keep the first line as column header, the following lines as data line, select all the data lines and header
line, then copy (CTRL+C)

* in target form, switch to edit mode, place the cursor in the textarea, press CTRL+V

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
