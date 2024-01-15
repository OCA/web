The duplicate option is disabled by default.
To enable it you have to add attribute `duplicate` to the tree view.
Set `duplicate` to `true` to enable it or `false` to (explicitly) disable it.

Example:

.. code-block:: xml

    <?xml version="1.0" encoding="UTF-8" ?>
    <odoo>
        <record id="view_users_tree" model="ir.ui.view">
            <field name="model">res.users</field>
            <field name="inherit_id" ref="base.view_users_tree"/>
            <field name="arch" type="xml">
                <xpath expr="//tree" position="attributes">
                    <attribute name="duplicate">true</attribute>
                </xpath>
            </field>
        </record>
    </odoo>
