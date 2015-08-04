Colorize field in tree views
============================

This module aims to add support for dynamically coloring fields in tree view
according to data in the record.

It provides new attributes with the same syntax as 'colors' attribute in tree tag.

Features
========

* Add attribute 'bg_color' to color background of a cell in tree view

* Add attribute 'fg_color' to change text color of a cell in tree view


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



Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/web/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us smashing it by providing a detailed and welcomed feedback
`here <https://github.com/OCA/web/issues/new?body=module:%20web_widget_color_tree_field%0Aversion:%208.0%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_.


Credits
=======

Contributors
------------

* Damien Crier <damien.crier@camptocamp.com>

Maintainer
----------

.. image:: http://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: http://odoo-community.org

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose
mission is to support the collaborative development of Odoo features and
promote its widespread use.

To contribute to this module, please visit http://odoo-community.org.
