Colorize field in tree views
============================

This module aims to add support for dynamically coloring fields in tree view
according to data in the record.

It provides attributes on fields with the same syntax as the 'colors' attribute
in tree tags.

Further, it provides a ``color_field`` attribute on tree tags to use a field's
value as color.

Features
========

* Add attribute ``bg_color`` on fields to color background of a cell in tree view

* Add attribute ``fg_color`` on fields to change text color of a cell in tree view

* Add attribute ``color_field`` on the tree element to use as color


Usage
=====

* In the tree view declaration, put bg_color="red:customer==True;" attribute in the field tag::

    ...
    <field name="arch" type="xml">
        <tree string="View name">
            ...
            <field name="name" bg_color="red:customer==True;"/>
            ...
        </tree>
    </field>
    ...
    
    With this example, column which renders 'name' field will have its background colored in red.

* In the tree view declaration, put fg_color="white:customer==True;" attribute in the field tag::

    ...
    <field name="arch" type="xml">
        <tree string="View name">
            ...
            <field name="name" fg_color="white:customer==True;"/>
            ...
        </tree>
    </field>
    ...
    
    With this example, column which renders 'name' field will have its text colored in white.

* In the tree view declaration, use color_field="color" attribute in the tree tag::

    ...
    <field name="arch" type="xml">
        <tree string="View name" color_field="color">
            ...
            <field name="color" invisible="1" />
            ...
        </tree>
    </field>
    ...

    With this example, the content of the field named `color` will be used to
    populate the `color` CSS value. Use a function field to return whichever
    color you want depending on the other record values. Note that this
    overrides the `colors` attribute, and that you need the tree to load your
    field in the first place by adding it as invisible field.

Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/web/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smashing it by providing a detailed and welcomed feedback.

Credits
=======

Contributors
------------

* Damien Crier <damien.crier@camptocamp.com>
* Holger Brunn <hbrunn@therp.nl>

Maintainer
----------

.. image:: https://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: https://odoo-community.org

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose
mission is to support the collaborative development of Odoo features and
promote its widespread use.

To contribute to this module, please visit https://odoo-community.org.
