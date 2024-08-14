If in any case the exact date doesn't need to be displayed, we can disable the 
functionality by adding `options="{'exact_date': False}"` to the field that has the 
widget.

**Example**

.. code:: xml

  <field name="date_deadline" widget="remaining_days" options="{'exact_date': False}"/>