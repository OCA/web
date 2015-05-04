Web Widget Date Range
=====================

.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :alt: License: AGPL-3

This module provides a new list view widget view mode 'web_widget_date_range'
that adds a date range selector bar on top of your list view that allows you
to specify a date range for your list items.

The result looks like this:

.. image:: /web_widget_date_range/static/description/preview.png
    :alt: Web Widget Date Range

Usage
=====

To use this module, you need to:

* To use this list view we need to set the ``web_widget_date_range`` as
  view_mode for the window action that shows your view.

* Once on view, we can select the date for which we want to filter via
``Field Date`` selector

* To apply the query, you need to press the ``Apply``, there is also a
``Reset`` button via which we can reset the current query

Example
-------

Your window action could look like::
    ``
    <record id="my_view_id" model="ir.actions.act_window">
        <field name="type">ir.actions.act_window</field>
        ...
        <field name="view_type">form</field>
        <field name="view_mode">web_widget_date_range</field>
        ...
    </record>
    ``

Credits
=======

Contributors
------------

* Adil Houmadi <adil.houmadi@gmail.com>

Maintainer
----------

.. image:: https://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: https://odoo-community.org

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose
mission is to support the collaborative development of Odoo features and
promote its widespread use.

To contribute to this module, please visit http://odoo-community.org.
