Color widget for Odoo web client
================================

This module aims to add a color picker to Odoo.

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

You need to declare a char field of at least size 7::

    _columns = {
        'color': fields.char(
            u"Couleur",
            help=u"Toutes couleur valid css, exemple blue ou #f57900"
        ),
    }

    OR

    color = fields.Char(
        string="Color",
        help="Choose your color"
    )


In the view declaration, put widget='color' attribute in the field tag::

    ...
    <field name="arch" type="xml">
        <tree string="View name">
            ...
            <field name="name"/>
            <field name="color" widget="color"/>
            ...
        </tree>
    </field>
    ...

.. |picker| image:: ./images/picker.png
.. |formview| image:: ./images/form_view.png
.. |listview| image:: ./images/list_view.png


Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/web/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us smashing it by providing a detailed and welcomed feedback
`here <https://github.com/OCA/web/issues/new?body=module:%20web_widget_color%0Aversion:%208.0%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_.


Credits
=======

Contributors
------------

* Adil Houmadi <adil.houmadi@gmail.com>

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
