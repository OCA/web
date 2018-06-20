.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

==============
Web Graph Sort
==============

This module allows to sort pivot tables.

Usage
=====

To use this module, you need to:

#. Go to any pivot table.

   For example, if you have the invoicing module installed, go to Reporting -> Accounting -> Invoice Analysis

#. Click on a column header. The table will be sorted by that column.

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/162/8.0

Known issues / Roadmap
======================

* The columns are sorted according to the sum over the row. If you have multiple 
  accounting periods for example, if you click on the column header of the first semester,
  the rows will still be sorted by the total for the year.

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

* NDP Systèmes <http://www.ndp-systemes.fr>
* David Dufresne <david.dufresne@savoirfairelinux.com>

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
