You need to define the view fields. The view must be of ``form`` type.
This is an example that uses the 'sale.order.line' fields:

.. code:: xml

    <field
        name="order_line"
        attrs="{'readonly': [('state', 'in', ('done','cancel'))]}"
        nolabel="1"
        mode="form"
        widget="one2many_product_picker"
        options="{'search': [{'name': 'Test', 'domain': [['name', 'ilike', '$search']]}] ,'edit_discount': True, 'show_discount': True, 'groups': [{'name': 'desk', 'string': _('Desks'), 'domain': [('name', 'ilike', '%desk%')], 'order': [{'name': 'id', 'asc': true}]}, {'name': 'chair', 'string': _('Chairs'), 'domain': [('name', 'ilike', '%chair%')]}]}"
    >
        <form>
            <field name="state" invisible="1" />
            <field name="display_type" invisible="1" />
            <field name="currency_id" invisible="1" />
            <field name="discount" widget="numeric_step" options="{'max': 100}" invisible="1"/>
            <field name="price_unit" widget="numeric_step" invisible="1"/>
            <field name="name" invisible="1" />
            <field name="product_id" invisible="1" />
            <field name="order_id" invisible="1"/>
            <field name="product_uom_qty" class="mb-1" widget="numeric_step" context="{
                'partner_id': parent.partner_id,
                'quantity': product_uom_qty,
                'pricelist': parent.pricelist_id,
                'uom': product_uom,
                'company_id': parent.company_id
            }" />
            <field name="product_uom" force_save="1" attrs="{
                'readonly': [('state', 'in', ('sale','done', 'cancel'))],
                'required': [('display_type', '=', False)],
            }" context="{'company_id': parent.company_id}" class="mb-2" options="{'no_open': True, 'no_create': True, 'no_edit': True}" />
        </form>
    </field>


Other example for 'purchase.order.line' fields:

.. code:: xml

    <field
        name="order_line"
        attrs="{'readonly': [('state', 'in', ('done','cancel'))]}"
        nolabel="1"
        widget="one2many_product_picker"
        mode="form"
        options="{'search': [{'name': _('Name'), 'domain': [['name', 'ilike', '$search']]}, {'name': _('Price'), 'domain': [['list_price', '=', $number_search]]}], 'field_map': {'name': 'name', 'product': 'product_id', 'product_uom': 'product_uom', 'price': 'price_unit', 'parent_id': 'order_id', 'product_uom_qty': 'product_qty'}, 'groups': [{'name': _('Desk'), 'domain': [['name', 'ilike', 'desk']], 'order': {'name': 'id', 'asc': true}}, {'name': _('Chairs'), 'domain': [['name', 'ilike', 'chair']]}]}"
    >
        <form>
            <field name="name" invisible="1" />
            <field name="product_id" invisible="1" />
            <field name="price_unit" invisible="1"  />
            <field name="currency_id" invisible="1" />
            <field name="order_id" invisible="1" />
            <field name="date_planned" class="mb-1" />
            <field name="product_qty" class="mb-1" widget="numeric_step" required="1" />
            <field name="product_uom" class="mb-2" options="{'no_open': True, 'no_create': True, 'no_edit': True}" />
        </form>
    </field>

** In this example we don't use 'field_map' option because the default match with the sale.order.line field names.


Default context:
~~~~~~~~~~~~~~~~

The widget sends a defaults context with the 'search_read' request:

    * active_search_group_name > Contains the name of the active search group

        * 'all' > Is the hard-coded name for the 'All' group
        * 'main_lines' > Is the hard-coded name for the 'Lines' group


Preview:
~~~~~~~~

  .. image:: ../static/img/product_picker.gif
