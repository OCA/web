You need to declare the usage of the new widget as follows:
``<field name="xxx" widget="many2one_simple" options="...">``

If you have a database with demo data, you can test this widget following these instructions:

#. Go to Contacts.
#. Create or edit a record.
#. Set "Industry" field (in Sales & Purchase tab).
#. Only if you set the correct industry name ("Administrative" for example), it will be defined. Otherwise, it will try to create one with that name.

Example:
~~~~~~~~

.. code:: xml

  <field name="partner_id" widget="many2one_simple" regex="^1\d*" options="{&quot;search&quot;: { &quot;field&quot;: &quot;name&quot;, &quot;oper&quot;: &quot;ilike&quot; }}"/

** Only allows search by id's that starts with '1' ...
