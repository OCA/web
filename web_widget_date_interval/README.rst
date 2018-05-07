.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.png
    :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
    :alt: License: AGPL-3

==============
Date intervals
==============

This module was written to allow users to select some visual presentation of an interval instead of selecting a begin or end date.

Usage
=====

To use this module, use the widget ``date_interval`` on the field representing the begin of the interval. Make sure to also add the field representing the end of the interval, usually as hidden. Also add an ``options`` dictionary where you at least set the keys ``type`` and ``end_field``.

Depending on the type, you can add more configuration in the widget options, see below for a list depending on the interval type.

weeknumber_iso
--------------

``hide_years``
    if this is set, don't show a year selection
``years_before``
    allow the user to move to N years before the current date (or the field's value)
``years_after``
    allow the user to move to N years after the current date (or the field's value)

Example::

    <field name="date_start" widget="date_interval" options="{'type': 'weeknumber_iso', 'end_field': 'date_end'}" />

The module's demo data adds this to the form of model constraints.

Roadmap
=======

* add more interval types

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

* Odoo Community Association: `Icon <https://odoo-community.org/logo.png>`_.

Contributors
------------

* Holger Brunn <hbrunn@therp.nl>

Do not contact contributors directly about support or help with technical issues.

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
