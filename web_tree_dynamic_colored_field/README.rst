.. image:: https://img.shields.io/badge/license-LGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/lgpl-3.0-standalone.html
   :alt: License: LGPL-3

============================
Colorize field in tree views
============================

This module aims to add support for dynamically coloring fields in tree view
according to data in the record.

It provides attributes on fields with the similar syntax as the ``colors`` attribute
in tree tags.

Further, it provides a ``color_field`` attribute on tree tags's ``colors`` to use
a field's value as color.

Features
========

* Add attribute ``bg_color`` on field's ``options`` to color background of a cell in tree view
* Add attribute ``fg_color`` on field's ``options`` to change text color of a cell in tree view
* Add attribute ``color_field`` on the tree element's ``colors`` to use as color

Usage
=====

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

Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/web/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smash it by providing a detailed and welcomed feedback.

Credits
=======

Contributors
------------

* Damien Crier <damien.crier@camptocamp.com>
* Holger Brunn <hbrunn@therp.nl>
* Artem Kostyuk <a.kostyuk@mobilunity.com>
* Guewen Baconnier <guewen.baconnier@camptocamp.com>

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
