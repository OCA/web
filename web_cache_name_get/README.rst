.. image:: https://img.shields.io/badge/license-LGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/lgpl-3.0-standalone.html
   :alt: License: LGPL-3

================
Cache name_get()
================

This module improves the loading time of some views: mainly sale or purchase orders 
with many order lines.

It reduce the numer of useless requests done by the user's browser.


This modules cache some requests to name_get() done from list views.

For instance, if you have 40 sale order lines on a sale. All theses lines have the same tax.

- Without this module : your browser makes about 40 time the same name_get() request.
- With this modules: your browser makes 1 request and reuse the result for all the lines.

It works on many2many on list views.
The cache is cleaned when you navigate to other objects.


Usage
=====


.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/162/10.0

Known issues / Roadmap
======================

* The cache is not very aggressive, if put more globally it may catch more useless requests.


Credits
=======

Contributors
------------

* Raphaël Reverdy <raphael.reverdy@akretion.com>


Funders
-------

The development of this module has been financially supported by:

* Akretion


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
