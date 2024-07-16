This module does nothing by himself, it is meant to be used by other modules.
It add the ability to hide some buttons of the view when the user is on edit mode.
This can be achieved adding the class `o_hide_on_edit` to the buttons, like in this example:

.. code-block:: xml

    <record id="view_move_form" model="ir.ui.view">
        <field name="model">account.move</field>
        <field name="inherit_id" ref="account.view_move_form" />
        <field name="arch" type="xml">
            <button name="action_post" position="attributes">
                <attribute name="class">oe_highlight o_hide_on_edit</attribute>
            </button>
            <xpath expr="//button[@name='action_post'][last()]" position="attributes">
                <attribute name="class">oe_highlight o_hide_on_edit</attribute>
            </xpath>
        </field>
    </record>
