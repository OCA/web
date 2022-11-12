Set a color attribute value on any many2one calendar field set as filter and
set the calendar's color attribute to use the same many2one field.

Example:

.. code-block:: xml

    <calendar color="category_id">
        <field name="category_id" filter="1" color="kanban_color"/>
    </calendar>

- `category_id` is a `Many2one` field in your record.
- `kanban_color` is an integer field in your category record.
