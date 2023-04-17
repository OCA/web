You need to declare the usage of the new widget as follows:
``<field name="xxx" widget="many2one_simple" options="{'mailto_field': 'name_of_field'}">``

Example:
~~~~~~~~

This example adds a mailto link to employee manager field.

.. code:: xml

  <field
    name="parent_id"
    widget="many2one_mailto"
    options="{'mailto_field': 'work_email'}"
  />
