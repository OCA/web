.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

===========================
Web Switch Company Warning
===========================


Shows a warning if current company has been switched in another tab or window.


Known issues / Roadmap
======================


    * If the browser don't implement Sharded Worker (http://www.w3.org/TR/workers/#sharedworker), the warning message will not be displayed (there is no polyfill).

    * Switching company in a separate browser or in private browsing mode will not be detected by this module. It's a limitation of Shared Wworker(limit to browser session, server:port...)


Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/
web/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us smashing it by providing a detailed and welcomed feedback `here <https://github.com/OCA/
web/issues/new?body=module:%20
web_switch_company_warning%0Aversion:%20
0.1%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_.


Credits
=======

Contributors
------------

* Hparfr <https://github.com/hparfr>

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
