
Datepicker Widget Options
=========================

This module allows passing options to the jquery datepicker for fields that use
the datepicker widget. The option are passed as-is and are not validated.

To see all supported options, see the [api-documentation][1]

[1]: http://api.jqueryui.com/datepicker/ "api-documentation"


Usage
=====

You must pass all options through the "datepicker" field in the options::

    ...
    <field name="date" options="{'datepicker':{'yearRange': 'c-100:c+0'}}"/>
    ...

Known issues / Roadmap
======================

* Absolutely no validation on options.

Credits
=======

Contributors
------------

* Vincent Vinet <vincent.vinet@savoirfairelinux.com>

Maintainer
----------

.. image:: http://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: http://odoo-community.org

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose mission is to support the collaborative development of Odoo features and promote its widespread use.

To contribute to this module, please visit http://odoo-community.org.

