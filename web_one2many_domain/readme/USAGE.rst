In your xml view, add ``domain="[['fieldA', '=', True]]"``
This will filter all records with fieldA setted.

.. code:: xml

  <field name="field_min_price" />
  <field name="order_line" domain="[['unit_price', '>', field_min_price]]">
    <tree>
      <field name="product_id" />
    </tree>
  </field>
