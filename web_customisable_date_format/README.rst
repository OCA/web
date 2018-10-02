.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

========================
Customisable date format
========================

This module adds the possibility to specify a rendering format
for date and datetime fields, using MomentJS tokens.

Configuration
=============

No configuration necessary.

Usage
=====

To use this module, first of all add it in the dependencies of your module, then:

* In list view columns, use the ``date_format="<momentjs tokens>"`` attribute
  on a date or datetime field, example::

  <field name="start_date" date_format="DD - dddd"/>

* In form fields, use the ``options`` attributes::

  <field name="start_date" options="{'date_format': 'DD - dddd'}"/>

You can find here the `list of valid MomentJS tokens <http://momentjs.com/docs/#/displaying/format/>`_.

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/162/10.0-web_widget_date_format

.. repo_id is available in https://github.com/OCA/maintainer-tools/blob/master/tools/repos_with_ids.txt
.. branch is "8.0" for example

Known issues / Roadmap
======================

* Add support for datetime columns in tree views

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

* Odoo Community Association: `Icon <https://github.com/OCA/maintainer-tools/blob/master/template/module/static/description/icon.svg>`_.

Contributors
------------

* Leonardo Donelli @ MONKSoftware <donelli@webmonks.it>

Funders
-------

The development of this module has been financially supported by:

* MONK Software

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
