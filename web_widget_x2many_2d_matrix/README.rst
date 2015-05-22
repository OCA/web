2D matrix for x2many fields
===========================

This module allows to show an x2many field with 3-tuples
($x_value, $y_value, $value) in a table

          $x_value1   $x_value2 
========= =========== ===========
$y_value1 $value(1/1) $value(2/1)
$y_value2 $value(1/2) $value(2/2)
========= =========== ===========

where `value(n/n)` is editable.

An example use case would be: Select some projects and some employees so that
a manager can easily fill in the planned_hours for one task per employee. The
result could look like this:

.. image:: /web_widget_x2many_2d_matrix/static/description/screenshot.png
    :alt: Screenshot

The beauty of this is that you have an arbitrary amount of columns with this widget, trying to get this in standard x2many lists involves some quite agly hacks.

Usage
=====

Use this widget by saying::

<field name="my_field" widget="x2many_2d_matrix" />

This assumes that my_field refers to a model with the fields `x`, `y` and
`value`. If your fields are named differently, pass the correct names as
attributes::

<field name="my_field" widget="x2many_2d_matrix" field_x_axis="my_field1" field_y_axis="my_field2" field_value="my_field3" />

You can pass the following parameters:

field_x_axis
    The field that indicates the x value of a point
field_y_axis
    The field that indicates the y value of a point
field_label_x_axis
    Use another field to display in the table header
field_label_y_axis
    Use another field to display in the table header
field_value
    Show this field as value
show_row_totals
    If field_value is a numeric field, calculate row totals
show_column_totals
    If field_value is a numeric field, calculate column totals

Known issues / Roadmap
======================

* it would be worth trying to instantiate the proper field widget and let it render the input


Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/web/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us smashing it by providing a detailed and welcomed feedback
`here <https://github.com/OCA/web/issues/new?body=module:%20web_widget_x2many_2d_matrix%0Aversion:%208.0%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_.


Credits
=======

Contributors
------------

* Holger Brunn <hbrunn@therp.nl>

Maintainer
----------

.. image:: http://odoo-community.org/logo.png
    :alt: Odoo Community Association
    :target: http://odoo-community.org

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose mission is to support the collaborative development of Odoo features and promote its widespread use.

To contribute to this module, please visit http://odoo-community.org.
