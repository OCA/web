You need to declare a char field::

    color = fields.Char(
        string="Color",
        help="Choose your color"
    )


In the view declaration, put widget='color' attribute in the field tag::

    ...
    <field name="arch" type="xml">
        <tree string="View name">
            ...
            <field name="color" widget="color"/>
            ...
        </tree>
    </field>
    ...
    <field name="arch" type="xml">
        <form string="View name">
            ...
            <field name="color" widget="color"/>
            ...
        </form>
    </field>
    ...

Widget Options::

    - readonly_mode
        - 'default' > Color Box + text
        - 'color' > Only Color Box
        - 'text' > Only Text
    ...
    <field name="arch" type="xml">
        <tree string="View name">
            ...
            <field name="color" widget="color" options="{'readonly_mode': 'color'}"/>
            ...
        </tree>
    </field>
    ...
