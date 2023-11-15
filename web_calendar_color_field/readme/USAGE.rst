Set a color attribute value on any many2many calendar field set as filter and
set the calendar's color attribute to use the same many2many field.

Example:

.. code-block:: xml

    <calendar color="categ_ids">
        <field name="categ_ids" filters="1"/>
    </calendar>

- `categ_ids` is a `Many2many` field in your record which has color field defined.
