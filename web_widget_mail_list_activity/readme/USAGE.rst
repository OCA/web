Your model must inherit the ``mail.activity.mixin`` abstract model.

    class MyModel(models.Model):
        _inherit = ['mail.thread', 'mail.activity.mixin']
        _name = 'my.model'

In the list view definition, you must add the ``activity_ids`` field with the backported widget.

    <field name="activity_ids" widget="list_activity"/>

If you need to colorize the label, you can also set it using ``options``:

    <field name="activity_ids" widget="list_activity" options="{'colorize_label': True}"/>