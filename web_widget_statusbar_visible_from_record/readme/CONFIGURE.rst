Having a model with a field `stage_id` that is displayed with
`widget="statusbar"`, with this module installed you can add a new attribute
`visible_states_field` to the field definition in the model's form view
to indicate a field on the model that contains the states that should
be visible for each individual record.

.. code-block:: xml

    <field name="state" widget="statusbar" visible_states_field="visible_states_for_state" />

The indicated field should be a `Char` field, and its content should be
a comma-separated list of states.

If your state field is of type `Many2one`, the contents of your visible states
field needs to be a comma-separated list of numeric ids.

The visible states field needs to be present in the form view, but it can be
invisible.

The current state of the record is always visible, even if it is not in the
list of visible states for your record.

If the visible states field is not present on the form or not populated, all
states will be visible.

Odoo provides a `statusbar_visible` attribute on the widget level itself. It can
be used to globally filter out states that should be visible. When both
mechanisms are active, a state has to be present in both lists to be visible.
