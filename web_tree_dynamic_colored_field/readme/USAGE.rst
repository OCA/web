* In the tree view declaration, put ``options='{"bg_color": "red: customer==True"}`` attribute in the ``field`` tag::

    ...
    <field name="arch" type="xml">
        <tree string="View name">
            ...
            <field name="name" options='{"bg_color": "red: customer == True"}'/>
            ...
        </tree>
    </field>
    ...

    With this example, column which renders 'name' field will have its background colored in red.

* In the tree view declaration, put ``options='{"fg_color": "white:customer == True"}'`` attribute in the ``field`` tag::

    ...
    <field name="arch" type="xml">
        <tree string="View name">
            ...
            <field name="name" options='{"fg_color": "white:customer == True"}'/>
            ...
        </tree>
    </field>
    ...

    With this example, column which renders 'name' field will have its text colored in white on a customer records.

* In the tree view declaration, use ``options='"color_field": "my_color"'`` attribute in the ``tree`` tag::

    ...
    <field name="arch" type="xml">
        <tree string="View name" colors="color_field: my_color" >
            ...
            <field name="my_color" invisible="1"/>
            ...
        </tree>
    </field>
    ...

* You can also use ``colors="bg_color_field: my_color"`` to defined the field name that will be used
  for the background color of the line.

* If you want to use more than one color, you can split the attributes using ';':

.. code::

   options='{"fg_color": "red:red_color == True; green:green_color == True"}'

Example:

.. code:: xml

   ...
    <field name="arch" type="xml">
        <tree string="View name">
            ...
            <field name="name" options='{"fg_color": "red:red_color == True; green:green_color == True"}'/>
            ...
        </tree>
    </field>
    ...

    With this example, the content of the field named `my_color` will be used to
    populate the `my_color` CSS value. Use a function field to return whichever
    color you want depending on the other record values. Note that this
    overrides the rest of `colors` attributes, and that you need the tree
    to load your field in the first place by adding it as invisible field.

**Note that you should always use single quotes for fields' ``options`` and wrap nested values in double quotes since ``options`` is a JSON object.**
