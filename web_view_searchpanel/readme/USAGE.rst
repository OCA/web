This tool allows to quickly filter data on the basis of given fields. The fields
are specified as direct children of the ``searchpanel`` with tag name ``field``,
and the following attributes:

* ``name`` (mandatory) the name of the field to filter on
* ``select`` determines the behavior and display.
* ``groups``: restricts to specific users
* ``string``: determines the label to display
* ``icon``: specifies which icon is used
* ``color``: determines the icon color

Possible values for the ``select`` attribute are

* ``one`` (default) at most one value can be selected. Supported field types are many2one and selection.
* ``multi`` several values can be selected (checkboxes). Supported field types are many2one, many2many and selection.

Additional optional attributes are available in the ``multi`` case:

* ``domain``: determines conditions that the comodel records have to satisfy.

A domain might be used to express a dependency on another field (with select="one")
of the search panel. Consider

.. code-block:: xml

    <searchpanel>
        <field name="department_id"/>
        <field name="manager_id" select="multi" domain="[('department_id', '=', department_id)]"/>
    </searchpanel>

In the above example, the range of values for manager_id (manager names) available at screen
will depend on the value currently selected for the field ``department_id``.

* ``groupby``: field name of the comodel (only available for many2one and many2many fields). Values will be grouped by that field.

* ``disable_counters``: default is false. If set to true the counters won't be computed.

This feature has been implemented in case performances would be too bad.

Another way to solve performance issues is to properly override the ``search_panel_select_multi_range`` method.
