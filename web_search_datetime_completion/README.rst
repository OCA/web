.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :alt: License: AGPL-3
More completion options for datetime fields
===========================================

This module was written to extend the offers shown to the user when starting to fill in a date. In standard odoo, the only offer is the date at 00:00:00 hours, while it can be convenient for the user to have other options, too. When searching for the end of a period, ``23:59:59`` would come to mind, and there also might be domain specific times that make sense.

Configuration
=============

If you do nothing, only the time ``23:59:59`` is added to the completion dropdown.

In your code, you can add an options dictionary with a key ``completion_options`` which contains a list if dictionaries detailing the offsets that should be added to the parsed date, like::

<field name="my_datetime_field" options="{'completion_options': [{'hours': 12, 'minutes': 30, 'seconds': 0}]}" />

which would offer to search for the date at half past twelve. Note that when you set ``completion_options``, you have to list all options you want to see, as the standard options will be replaced with your list.

Usage
=====

Start filling in your date in a search field and choose one of the additional options offered.

For further information, please visit:

* https://www.odoo.com/forum/help-1

Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/web/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us smashing it by providing a detailed and welcomed feedback
`here <https://github.com/OCA/web/issues/new?body=module:%20web_search_datetime_completion%0Aversion:%208.0%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_.

Credits
=======

Contributors
------------

* Holger Brunn <hbrunn@therp.nl>

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
