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

The order of the ``<parent>`` elements controls the order of group types on
each level of the tree.

The root of the tree displays all groups and records that have no parent.

Here is an example to display projects with their tasks and sub-tasks
(recursively). At the root, it will display all projects (as groups) as well
as all tasks (as records) that have no parent and no project. Note that the
first relationship has a domain: this is to ensure that only tasks that have
no parent will be shown as children of their project.

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
