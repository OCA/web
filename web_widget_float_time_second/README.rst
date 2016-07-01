.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :alt: License

========================
Widget Float Time Second
========================

* This module creates a new widget for float fields (float_time_second)
that converts those fields into HH:MM:SS format.

* New configuration parameter in General Settings. When checked the
system will automaticaly load float_time fields with float_time_second
format.

Known issues / Roadmap
======================

* When you select Time Float (HH:MM:SS) in General Configuration, in tree views with float_time widget it only applies the format change to the first line. And when you disable the check it still continues applying the format with the seconds to the first line.

Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/web/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us smashing it by providing a detailed and welcomed feedback
`here <https://github.com/OCA/web/issues/new?body=module:%20web_dashboard_open_action%0Aversion:%208.0%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_.

Credits
=======

Contributors
------------

* Ainara Galdona <ainaragaldona@avanzosc.es>
* Ana Juaristi <anajuaristi@avanzosc.es>
* Pedro M. Baeza <pedro.baeza@serviciosbaeza.com>

Maintainer
----------

.. image:: http://odoo-community.org/logo.png
    :alt: Odoo Community Association
    :target: http://odoo-community.org

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose mission is to support the collaborative development of Odoo features and promote its widespread use.

To contribute to this module, please visit http://odoo-community.org.
