Your XML form view definition should contain::

    ...
    <field name="field_name" widget="bootstrap_markdown"/>
    ...

For **Html** defined fields, you can add an option of boolean true::

    ...
    <field name="field_name" widget="bootstrap_markdown" options="{'use_markdown': true}"/>
    ...

This will render the Html field as typical html and edit as markdown.
Otherwise,  use html as odoo provides without the widget.
