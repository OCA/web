==============================
Web Widget Daterange
==============================

This module provides widget daterange backported from odoo 13.0.


**Table of contents**

.. contents::
   :local:

Usage
=====

This widget allow user to select start and end date into single picker.
Supported field types: *date*, *datetime*
Options:
- related_start_date: apply on end date field to get start date value which is used to display range in the picker.
- related_end_date: apply on start date field to get end date value which is used to display range in the picker.
- picker_options: extra settings for picker.

.. code-block:: xml
   <field name="start_date_field" widget="daterange" options='{"related_end_date": "end_date_field"}'/>
   <field name="end_date_field" widget="daterange" options='{"related_start_date": "start_date_field"}'/>

Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/web/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us smashing it by providing a detailed and welcomed
`feedback <https://github.com/OCA/web/issues/new?body=module:%20web_widget_digitized_signature%0Aversion:%2012.0%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_.

Do not contact contributors directly about support or help with technical issues.



Contributors
~~~~~~~~~~~~

* Ayoub Zahid <azahid@agilorg.com>



Maintainers
~~~~~~~~~~~

This module is maintained by the OCA.

.. image:: https://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: https://odoo-community.org

OCA, or the Odoo Community Association, is a nonprofit organization whose
mission is to support the collaborative development of Odoo features and
promote its widespread use.

.. |maintainer-AyoubZahid| image:: https://github.com/AyoubZahid.png?size=40px
    :target: https://github.com/AyoubZahid
    :alt: AyoubZahid

Current `maintainer <https://odoo-community.org/page/maintainer-role>`__:

|maintainer-AyoubZahid|

This module is part of the `OCA/web <https://github.com/OCA/web/tree/12.0/web_widget_digitized_signature>`_ project on GitHub.

You are welcome to contribute. To learn how please visit https://odoo-community.org/page/Contribute.
