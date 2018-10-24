With this module installed, in addition to ``decoration-${name}`` to set the
text color, you can use ``decoration-bg-${name}`` to set the row background
color. Refer to the `odoo documentation`_ to see what kind of values you can use
for ``${name}``.

.. _odoo documentation: https://www.odoo.com/documentation/10.0/reference/views.html#lists

For example, to set to gray the background color of sale order line rows with
quantity = 0::

   <tree decoration-bg-grayed-out="product_uom_qty == 0">
     [ .. fields .. ]
   </tree>
