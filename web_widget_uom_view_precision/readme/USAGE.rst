Set your preferred precision on UOM records.

In the form view declaration, put widget='uom' attribute in the field tag::

    ...
    <field name="arch" type="xml">
        <form string="View name">
            ...
            <field name="quantity_field" widget="uom"/>
            ...
        </form>
    </field>
    ...


You can also specify the uom field with (default is "uom_id")::

    ...
    <field name="mytimefieldname" widget="uom" options="{'uom_field': 'myUOMfield'}"/>
    ...


