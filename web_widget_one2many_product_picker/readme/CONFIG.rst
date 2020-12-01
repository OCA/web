Create or edit a new view and use the new widget called 'one2many_product_picker'.

Widget options:
~~~~~~~~~~~~~~~

* product_per_page > Integer -> Used to control the load more behaviour (16 by default)
* groups > Array of dictionaries -> Declare the groups

    * name -> The group name
    * string -> The text displayed
    * domain -> Forced domain to use
    * order -> The order

        * name -> The field name to order
        * asc -> Flag to use 'asc' order

* currency_field > Model field used to format monetary values ('currency_id' by default)
* field_map > Dictionary:

    * product -> The field that represent the product (`product_id` by default)
    * name -> The field that represent a name ('name' by default)
    * product_uom -> The field that represent a product_uom ('product_uom' by default)
    * product_uom_qty -> The field that represent a product_uom_qty ('product_uom_qty' by default)
    * price_unit -> The field that represent a price_unit ('price_unit' by default)
    * discount -> The field that represent a discount ('discount' by default)

* search > Array of dictionaries or Array of 'triplets' ([[field_map.name, 'ilike', '$search']] by default)

    * name -> The name to display
    * domain -> The domain to use

        * $search -> Replaces it with the current value of the searchbox
        * $number_search -> Replaces all the leaf with the current value of the searchbox as a number

* edit_discount > Enable/Disable discount edits (False by default)
* edit_price > Enable/Disable price edits (True by default)
* show_discount > Enable/Disable display discount (False by default)
* show_subtotal > Enable/Disable show subtotal (True by default)

All widget options are optional.
Notice that you can call '_' method to use translations. This only can be used with this widget.

Example:

.. code::

    options="{'search': [{'name': _('Starts With'), 'domain': [('name', '=like', '$search%')]}], 'groups': [{'name': 'cheap', 'string': _('Cheap'), 'domain': [('list_price', '<', 10.0)], 'field_map': { 'product': 'my_product_id' }}]}"
