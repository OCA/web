In the form view declaration, put widget='timepicker' attribute in the field tag::

    ...
    <field name="arch" type="xml">
        <form string="View name">
            ...
            <field name="name"/>
            <field name="mytimefieldname" widget="timepicker"/>
            ...
        </form>
    </field>
    ...

Additional bootstrap datetime-picker plugin options can be specified by an options attribute::

    ...
    <field name="mytimefieldname" widget="timepicker" options="{'datepicker': {'stepping': 15}}"/>
    ...

See the available options at `datetime-picker <https://eonasdan.github.io/bootstrap-datetimepicker/Options/>`_.
