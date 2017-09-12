.. image:: https://img.shields.io/badge/licence-LGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/lgpl-3.0-standalone.html
   :alt: License: LGPL-3

===============================
Odoo 11.0 Domain Widget Preview
===============================

This module replaces the functionality of the domain widget to use a preview of
the brand new interface that will be found in Odoo 11.0.

Usage
=====

To use this module, you need to:

#. Enable the developer mode.
#· Go to *Settings > Technical > User interface > User-defined Filters* and
   choose or create one.
#. Choose a model if there is none.
#. You will be able to choose the domain using the updated domain widget.

Install any addon that makes use of the domain widget (i.e. ``mass_mailing``)
and you will be also able to use the new widget there.

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/162/10.0

Known issues / Roadmap
======================

* This addon replaces the built-in ``char_domain`` widget, so it can break
  compatibility with other addons that use or extend it.

Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/web/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smash it by providing detailed and welcomed feedback.

Credits
=======

Most code copied from https://github.com/odoo/odoo/tree/68176d80ad6053f52ed1c7bcf294ab3664986c46/addons/web/static/src

Images
------

* Odoo Community Association: `Icon <https://github.com/OCA/maintainer-tools/blob/master/template/module/static/description/icon.svg>`_.

Contributors
------------

* Odoo SA <https://www.odoo.com>
* Jairo Llopis <jairo.llopis@tecnativa.com>

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
