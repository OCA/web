Declare a ``diagram`` view in your module's view XML:

.. code-block:: xml

   <record id="view_my_model_diagram" model="ir.ui.view">
       <field name="name">my.model.diagram</field>
       <field name="model">my.model</field>
       <field name="type">diagram</field>
       <field name="arch" type="xml">
           <diagram>
               <node object="my.node.model"
                     shape="rectangle:is_final"
                     bgcolor="green:is_start">
                   <field name="name"/>
                   <field name="active" invisible="1"/>
               </node>
               <arrow object="my.connector.model"
                      source="source_id"
                      destination="destination_id"
                      label="[('name', '!=', False)]">
                   <field name="name"/>
               </arrow>
               <label string="Legend text here"/>
           </diagram>
       </field>
   </record>

Then add ``diagram`` to the ``view_mode`` of your window action:

.. code-block:: xml

   <record id="action_my_model" model="ir.actions.act_window">
       <field name="name">My Model</field>
       <field name="res_model">my.model</field>
       <field name="view_mode">tree,form,diagram</field>
   </record>

**Navigating to the diagram view**

Because Odoo 16 no longer includes the diagram view in the view type
switcher (which only appears for multi-record views such as list and
kanban), the recommended way to expose the diagram is via a stat button
on the form view:

.. code-block:: xml

   <div class="oe_button_box" name="button_box">
       <button class="oe_stat_button"
               type="object"
               name="action_open_diagram"
               icon="fa-code-fork">
           <div class="o_field_widget o_stat_info">
               <span class="o_stat_text">Diagram</span>
           </div>
       </button>
   </div>

And the corresponding Python method on your model:

.. code-block:: python

   def action_open_diagram(self):
       action = self.env['ir.actions.act_window']._for_xml_id(
           'your_module.action_your_diagram'
       )
       action['res_id'] = self.id
       action['views'] = [(False, 'diagram')]
       return action
