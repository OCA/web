===========================
OpenERP web_color module
===========================

This module aims to add a color picker to openERP/Odoo.

It's a `jsColor <http://jscolor.com/>`_ lib integration.


Features
========

* The picker allow the user to quickly select a color on edit mode

  |picker|

  .. note::

      Notice how html code and the background color is updating when selecting a color.


* Display the color on form view when you are not editing it

  |formview|

* Display the color on list view to quickly find what's wrong!

  |listview|


Requirements
============

This module has been ported to 8.0


Usage
=====

It adds a new data type ``color``. To apply it, simply change the field
declaration as following::

    _columns = {
    'color': fields.color(
        u"Couleur",
        help=u"Toutes couleur valid css, exemple blue ou #f57900"),


    OR

    color = fields.Color(
        string="Color",
        required=False,
        help="Choose your color"
    )


In the view declaration there is nothing especial to do, 
add the field as any other one. Here is a part of tree view example::

    ...
    <field name="arch" type="xml">
        <tree string="View name">
            ...
            <field name="name"/>
            <field name="color"/>
            ...
        </tree>
    </field>
    ...


.. |picker| image:: ./doc/picker.png
.. |formview| image:: ./doc/form_view.png
.. |listview| image:: ./doc/list_view.png
