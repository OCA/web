.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

=======================
Web Digitized Signature
=======================

This module provides a widget for binary fields that allows to digitize a
signature and store it as an image.

As demonstration, it includes this widget at user level, so that we can store
a signature image for each user.

Configuration
=============

#. To use this module, you need to add ``widget="signature"`` to your binary
   field in your view.
#. You can specifify signature dimensions like the following:
   ``<field name="signature_image" widget="signature" width="400" height="100"/>``

Usage
=====

#. Go to *Settings > Users > Users*.
#. Open one of the existing users.
#. You can set a digital signature for it on the field "Signature".


.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/162/10.0

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

* Jay Vora <jay.vora@serpentcs.com>
* Vicent Cubells <vicent.cubells@tecnativa.com>

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
