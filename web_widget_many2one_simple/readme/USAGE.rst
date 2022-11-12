You need to declare the usage of the new widget as follows:
``<field name="xxx" widget="many2one_simple" options="...">``

Example:
~~~~~~~~

.. code:: xml

  <field name="partner_id" widget="many2one_simple" regex="^1\d*" options="{&quot;search&quot;: { &quot;field&quot;: &quot;name&quot;, &quot;oper&quot;: &quot;ilike&quot; }}"/

** Only allows search by id's that starts with '1' ...
