This module works on all one2many tree views. The cloning process doesn't trigger onchange/default calls.

**Available Options**

- allow_clone > Add the icon to clone the line (default: false)

**Examples**

.. code:: xml

  <field name="order_line" widget="section_and_note_one2many" mode="tree,kanban" options="{'allow_clone': True}" attrs="{'readonly': [('state', 'in', ('done','cancel'))]}">
