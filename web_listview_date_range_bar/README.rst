.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :alt: License: AGPL-3

Listview date range bar.
========================

This module provides a new list view widget view mode 'listview_date_range_bar'
that adds a date range selector bar on top of your list view that allows you
to specifiy a date range for your list items.


Usage
=====

To use this module, you need to:

* To use this in your models list view set ``listview_date_range_bar`` as
  view_mode for the window action that shows your view.
* Everytime a date is changed a reload of the current content of the list view
  is triggered.
* The selected start and end dates are accessible in the context of the
  ``search()`` function in your model and subsequently called functions like
  ``read()``.
* To use the generic start/end dates from context to filter your model by
  custom fields, override ``search()`` in your model and modify the domain with
  the date range given in context before calling the super class ``search()``.
* The context fields to use are: ``list_date_range_bar_start`` / 
  ``list_date_range_bar_end``
* By default the date fields are empty. If ``list_date_range_bar_start``/
  ``list_date_range_bar_end`` are already present in context when showing the
  widget than their values are used to set the initial date range.

Example
-------

Your window action could look like::

    <record id="my_view_id" model="ir.actions.act_window">
        <field name="type">ir.actions.act_window</field>
        ...
        <field name="view_type">form</field>
        <field name="view_mode">listview_date_range_bar</field>
        ...
    </record>

Your models search function could look like this to filter on field ``my_date``::

    def search(self, cr, user, args, offset=0, limit=None, order=None,
               context=None, count=False):
        date_from = context and context.get('list_date_range_bar_start')
        if date_from:
            args.append(('my_date','>=', date_from))
        return super(my_model_class, self).\
            search(cr, user, args, offset=offset, limit=limit, order=order,
                   context=context, count=count)


Credits
=======

Contributors
------------

* Peter Hahn <peter.hahn@initos.com>

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
