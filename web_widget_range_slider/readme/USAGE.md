Use the widget name `range_slider` in float fields.

The available options are:
- `min`: Minimum value
- `max`: Maximum value
- `step`: Increment steps

Example:
```
    <?xml version="1.0" encoding="UTF-8" ?>
    <odoo>
        <record id="my_model" model="ir.ui.view">
            <field name="name">my_model.form</field>
            <field name="model">my_model</field>
            <field name="arch" type="xml">
                ...
                <field name="float_field" widget="range_slider" options="{'min':0, 'max':55, 'step': 5}"/>
                ...
            </field>
        </record>
    </odoo>
```