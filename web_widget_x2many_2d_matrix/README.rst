2D matrix for x2many fields
===========================

This module allows to show an x2many field with 3-tuples
($x_value, $y_value, $value) in a table

+-----------+-----------+-----------+
|           | $x_value1 | $x_value2 |
+===========+===========+===========+
| $y_value1 | $value1/1 | $value2/1 |
+-----------+-----------+-----------+
| $y_value2 | $value1/2 | $value2/2 |
+-----------+-----------+-----------+

where `valuen/n` is editable.


Usage
=====

Use this widget by saying::

<field name="my_field" widget="x2many_2d_matrix" />

This assumes that my_field refers to a model with the fields `x`, `y` and
`value`. If your fields are named differently, pass the correct names as
attributes::

<field name="my_field" widget="x2many_2d_matrix"
 field_x_axis="my_field1" field_y_axis="my_field2" field_value="my_field3" />

Known issues / Roadmap
======================

* ...

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
