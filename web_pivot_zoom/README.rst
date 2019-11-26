.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
    :alt: License: AGPL-3

===================
Zoom in pivot views
===================

This module was written to allow your users to zoom into cells in pivot views
by simply clicking a cell in question.

Usage
=====

The module will simply open a list view of the underlying model. You can change
what happens here on a per view or measure basis:

#. depend on this module
#. in the graph element, declare an options dictionary as in
   ``<graph type="pivot" options="{'web_pivot_zoom': {
         'model': 'account.move.line',
         'domain_map': {'user_type': 'account_id.user_type'}
      }}" />``

   to override the model to show, and to map field names in the report model
   to field names/dotted paths of the custom model. The above for example makes
   the accounting entries pivot work as expected.

#. in your measure elements in your pivot view, declare an options dictionary
   as in
   ``<field name="field" type="measure" options="{'web_pivot_zoom': {}}" />``

   The options dictionary must have a key ``model`` to inform the module which
   model should be shown, and can have a key ``domain`` for the domain to be
   used. If you set no domain, the current cell's domain will be used, this
   can be used to show rows from the pivot view's model.

   The domain is subject to evaluation, so you can use the grouped values in
   there. Note that if a field is not grouped, it will evaluate as ``None``, so
   the ``=?`` is your friend for expressions refering to the grouped fields.

   Note that not all field types support the ``=?`` operator. For many2many
   fields, you'd have to use a construction like
   ``('many2many_field', many2many_field and '=' or '!=', many2many_field)``
   to simulate this to some degree.

   Consult the demo data for an example, there, a graph view is added to the
   users model, and clicking cells sends you to partners with the company in
   question.

Measures with a configuration enabling zooming will have a small link icon next to the column title.

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
    :alt: Try me on Runbot
    :target: https://runbot.odoo-community.org/runbot/162/8.0

Roadmap
=======

* it might be convenient to be able to pass a window action's id

Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/web/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smashing it by providing a detailed and welcomed feedback.

Credits
=======

Images
------

* Odoo Community Association: `Icon <https://github.com/OCA/maintainer-tools/blob/master/template/module/static/description/icon.svg>`_.

Contributors
------------

* Holger Brunn <hbrunn@therp.nl>

Do not contact contributors directly about help with questions or problems concerning this addon, but use the `community mailing list <mailto:community@mail.odoo.com>`_ or the `appropriate specialized mailinglist <https://odoo-community.org/groups>`_ for help, and the bug tracker linked in `Bug Tracker`_ above for technical issues.

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
