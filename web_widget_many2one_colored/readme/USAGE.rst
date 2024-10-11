To use this widget, use the ``widget`` attribute on a ``Many2one`` field:

.. code-block:: XML

    <field
        name="type_id"
        widget="many2one_colored"
        options="{'no_open': True}"
    />

The ``no_open`` option is required for the field to appear in color, otherwise
it will be a hyperlink allowing to open the corresponding record, and thus
styled as a hyperlink.

By default, the widget uses a field named ``color`` of the target model to
determine the color. It should be an ``Integer`` field with values from 0 to
12 (corresponding to the colors available in the ``color_picker`` field
widget). To use another field of the target model, use the ``color_field``
option:

.. code-block:: XML

    <field
        name="type_id"
        widget="many2one_colored"
        options="{'no_open': True, 'color_field': 'display_color'}"
    />
