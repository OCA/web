This module allows to add an option `size` to Char fields in web client:

.. code-block:: XML

    <field name="sized_5_field" options="{'size': 5}"/>

that allows to enter only the specified number of characters in the field.

Note that adding the `size=` attribute in Char field definition raises the following warning:

 unknown parameter 'size', if this is an actual parameter you may want to override the method _valid_field_parameter on the relevant model in order to allow it
