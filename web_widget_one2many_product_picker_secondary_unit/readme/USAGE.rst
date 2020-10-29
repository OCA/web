Create or edit a new view and use the new widget called 'one2many_product_picker'.

Widget options:
~~~~~~~~~~~~~~~

* product_per_page > Integer -> Used to control the auto-load behaviour (scroll-pagination)
* groups > Array of dictionaries -> Declare the groups
* currency_field > Model field used to format monetary values
* field_map > Dictionary:

    * product -> The field that represent the product_id
    * name -> The field that represent a name
    * product_uom -> The field that represent a product_uom
    * product_uom_qty -> The field that represent a product_uom_qty
    * price_unit -> The field that represent a price_unit
    * parent_id -> The field that represent the main record


Group dictionary definition:

* name -> The group name
* domain -> Forced domain to use
* order -> The order

    * name -> The field name to order
    * asc -> Flag to use 'asc' order


Example:

```options="{'groups': [{'name': 'Cheap', 'domain': [('list_price', '<', 10.0)], 'field_map': { 'product': 'my_product_id' }}]}"```


Also you need define the view fields. The view must be a 'kanban' type.
This is an example that uses the 'sale.order.line' fields:

.. code:: xml

    <field
        name="order_line"
        attrs="{'readonly': [('state', 'in', ('done','cancel'))]}"
        nolabel="1"
        widget="one2many_product_picker"
        options="{'groups': [{'name': 'Desk', 'domain': [('name', 'ilike', '%desk%')], 'order': {'name': 'id', 'asc': true}}, {'name': 'Chairs', 'domain': [('name', 'ilike', '%chair%')]}]}"
    >
        <kanban>
            <field name="name"/>
            <field name="product_id" />
            <field name="product_uom_qty" />
            <field name="product_uom"/>
            <field name="price_unit"/>
            <field name="order_id"/>
        </kanban>
    </field>


** In this example we don't use 'field_map' option because the default match with the sale.order.line field names.
