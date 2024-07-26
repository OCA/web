To use the rtree view on a model, a view of that type must be defined for that
model. It is defined in the same way as a normal list (tree) view, but using
an ``<rtree>`` element instead of ``<tree>`` and with additional ``<parent>``
elements to define the hierarchy.

Each ``<parent>`` element defines a parent-child relationship to display. It
has the following attributes:

* ``parent``: the parent model of this relationship.
* ``child``: the child model of this relationship.
* ``field``: the field of the child model to access the parent.
* ``domain`` (optional): an optional domain to use when loading the children
  for this relationship.
* ``expand`` (optional): an optional boolean value that controls whether this
  relationship should be expanded automatically (false by default).

The order of the ``<parent>`` elements controls the order of model records on
each level of the tree.

The root of the tree displays all records of all models that have no parent.

Here is an example to display projects with their tasks and sub-tasks
(recursively). At the root, it will display all projects (with only their
``display_name``) followed by all tasks that have no parent and no project (as
regular records, with all fields). Note that the first relationship has a
domain: this is to ensure that only tasks that have no parent will be shown as
children of their project. Moreover, the first relationship has the ``expand``
boolean set to true, while the second hasn't: this means that project rows
will be expanded automatically, but tasks with sub-tasks will not.

.. code-block:: XML

    <record id="project_task_view_rtree" model="ir.ui.view">
        <field name="name">An rtree view for tasks</field>
        <field name="model">project.task</field>
        <field name="arch" type="xml">
            <rtree>
                <parent
                    parent="project.project"
                    child="project.task"
                    field="project_id"
                    domain="[('parent_id', '=', False)]"
                    expand="true"
                />
                <parent
                    parent="project.task"
                    child="project.task"
                    field="parent_id"
                />

                <field name="name" />
                <field name="milestone_id" />
                <!-- add more fields -->
            </rtree>
        </field>
    </record>

To make the view available, the ``rtree`` view mode must be added to the list
of view modes (``view_mode`` field) of the window action.

Filtering
~~~~~~~~~

If the search view defines a search on the ``display_name`` field, using it in
the rtree view will filter all records (of any model) on their
``display_name``. This uses the ``name_search()`` model method.

The filtering only works with a simple filter, not with | or & operators, thus
entering two values to filter on does not work.

Using secondary model fields
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

It is possible to use some fields of the secondary models, for example to
allow to reorder those records with a handle widget. This is done by adding
children ``field`` elements to the corresponding ``field`` element of the
view. For example, this would allow to reorder projects as well as tasks:

.. code-block:: XML

    <field name="sequence" widget="handle">
        <field model="project.project" name="sequence" />
    </field>
