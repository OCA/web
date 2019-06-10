To use this module, you need to declare a One2many or Many2many field::

    sale_order_ids = fields.One2many(
        "sale.order",
        "partner_id",
        string="Sales Order",
    )

In the view declaration, put widget="heatmap" attribute in the field tag::

    ...
    <field name="arch" type="xml">
        <form string="View name">
            ...
            <field name="sale_order_ids" widget="heatmap"/>
            ...
        </form>
    </field>
    ...

Widget Options::

    cellSize - Size of each subDomain cell, in pixel.
    ...
    <field name="arch" type="xml">
        <form string="View name">
            ...
            <field name="sale_order_ids" widget="heatmap" options="{'cellSize': 15}"/>
            ...
        </form>
    </field>
    ...


* All widget options you can find in the official `documentation <https://cal-heatmap.com/#options>`_ of the cal-heatmap lib.
