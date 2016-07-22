.. image:: https://img.shields.io/badge/licence-LGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/lgpl-3.0-standalone.html
   :alt: License: LGPL-3

===========================
Web Widget - Image Download
===========================

This module was written to extend the functionality of the image widget and allows to download it.

Usage
=====

To use this module, you need to:

#. Go to the section `Contacts`.
#. Click on a contact.
#. Edit the contact.
#. Click the `Download` button (between `Edit` and `Clear`).

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/162/8.0

Known Issues / Roadmap
======================

* In order to work correctly, this widget has to detect image type, the server should include this information in the `Content-Type` header. Right now, odoo is not doing so, but a fix has been `proposed <https://github.com/odoo/odoo/pull/12918>`_.
* For some unknown reason, the widget does not work in the `Preferences` view, because odoo is not rendering the **QWeb** template.

Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/web/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smashing it by providing a detailed and welcomed feedback.

Credits
=======

Contributors
------------

* Flavio Corpa <flavio.corpa@tecnativa.com>

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
