.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :target: https://www.gnu.org/licenses/agpl-3.0-standalone.html
    :alt: License: AGPL-3

===========================
Polymorphic many2one widget
===========================

The polymorphic field allows to dynamically store an id linked to any model in
Odoo instead of the usual fixed one in the view definition, allowing comfortable
editing in cases where you'd have to craft a reference field.

A notorious case is mail.message with fields ``res_id`` and ``res_model``::

    'res_model': fields.char(),
    'res_id': fields.integer('Resource')

Then in your view, you can say::

    <field name="res_model" invisible="1" />
    <field name="res_id" widget="many2one_polymorphic" options='{"model_field": "res_model"}' />

This way, the user gets the full featured many2one widget for the model in question.

Usage
=====

To use this module, you need to:

#. depend on it
#. use the widget in the integer field and pass the field to be used for the model in the options dictionary

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
    :alt: Try me on Runbot
    :target: https://runbot.odoo-community.org/runbot/162/10.0

Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/web_widget_many2one_polymorphic/issues>`_. In case of trouble, please
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
* Augustin Cisterne-Kaas <augustin.cisternekaas@elico-corp.com>

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
