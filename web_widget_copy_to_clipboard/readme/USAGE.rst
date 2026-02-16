To use this widget, add the appropriate widget attribute to your field in the XML view.

For Char fields (single line):
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: xml

    <field name="my_char_field" widget="copy_to_clipboard"/>

For Text fields (multi-line):
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: xml

    <field name="my_text_field" widget="copy_to_clipboard_text"/>

The widget will display a copy icon next to the field value only when the field is not empty and is in readonly mode.
