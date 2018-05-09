.. image:: https://img.shields.io/badge/licence-LGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/lgpl-3.0-standalone.html
   :alt: License: LGPL-3

===============================
Odoo Field Selector widget
===============================


Usage
=====

To use this module, you need to:

    #. define model_id selection field like below

    #. selection field populate with below function

.. code-block:: python

    model_id = fields.Selection(selection='_list_all_models', string='Model', required=False)

    @api.model
    def _list_all_models(self):
        self._cr.execute("SELECT model, name FROM ir_model ORDER BY name")
        return self._cr.fetchall()



To use this field in view
===========================
#. Define the char field with widget="field-selector"
#. Using attrs set field read-only until the model is selected like,


.. code-block:: xml

    <field name="fax" position="attributes">
                <attribute name="widget">field-selector</attribute>
                <attribute name="attrs">{'readonly': [('model_id','=', False)]}</attribute>
                <attribute name="data_model_field">model_id</attribute>
            </field>

