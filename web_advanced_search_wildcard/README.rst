.. image:: https://img.shields.io/badge/license-AGPL--3-blue.png
   :target: https://www.gnu.org/licenses/agpl
   :alt: License: AGPL-3

============================
Wildcard in advanced search
============================

This module adds 3 options to advanced search of char, many2one,
many2many and one2many fields:

* *starts with* (uses the domain *=ilike %<search string>*),
* *ends with* (uses the domain *=ilike <search string>%*),
* *matches* (uses the domain *=ilike <search string>*).

Usage
=====
When selecting *matches*, use **%** as a placeholder.

Example: "Zip" - 'matches' - "1%" gives all zip starting with 1

.. image:: /web_advanced_search_wildcard/static/description/screenshot.png
    :alt: Screenshot

Also allows insensitive exact search.
Example "Name" - 'matches' - "john" will find "John" and "john" but not "Johnson".

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/162/10.0

Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/web/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smash it by providing detailed and welcomed feedback.

Credits
=======

Images
------

* Odoo Community Association: `Icon <https://odoo-community.org/logo.png>`_.

Contributors
------------

* Markus Schneider <markus.schneider@initos.com>
* Thomas Rehn <thomas.rehn@initos.com>
* L Freeke <lfreeke@therp.nl>
* Alex Comba <alex.comba@agilebg.com>
* Alexis de Lattre <alexis.delattre@akretion.com>

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
