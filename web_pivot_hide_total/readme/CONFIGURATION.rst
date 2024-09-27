Activation of the view is done in xml file, using "js_class" tag.

In your xml file, declare a pivot view with js_class="web_pivot_hide_total".

For example :

.. code-block:: xml

  <record id='my_new_pivot_view' model='ir.ui.view'>
    <field name="model">my.model</field>
    <field name="arch" type="xml">
      <pivot string="My new pivot view name" js_class="web_pivot_hide_total">
        <field name="My field" type="row" />
        <field name="My column" type="col" />
        <field name="My measure" type="measure" />
      </pivot>
    </field>
  </record>
