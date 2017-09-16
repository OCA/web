.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
    :alt: License: AGPL-3

=====================
Web Validation Dialog
=====================

This module provides the functionality to generalize validation on any type of button.

* Offers company level validation & restricted access.
* Enhances webpage validation at the interface level.

Configuration
=============

To configure this module, you need to:

* Configure the *Security Code* in Company record.

Usage
=====

* Configure security code to buttons from company configuration menu.

.. image:: /web_validation_dialog/static/description/img/res_company.png
   :width: 70%

* Pass the options and confirm attributes inside the button as below:
* **<button name="method_name" type="object" string="Create Invoice" options='{"security": "security_field"}'/>**
* As shown in the image, here options attribute is passed to "Create Invoice" button.

.. image:: /web_validation_dialog/static/description/img/click_invoice.png
   :width: 70%

* So on clicking **"Create Invoice"** button a dialog box will open that will ask for Security Code.
* On entering correct Security Code, user will be redirected to next step.

.. image:: /web_validation_dialog/static/description/img/dialog.png
   :width: 70%

Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/web/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us smashing it by providing a detailed and welcomed feedback


Credits
=======

Images
------

* Odoo Community Association: `Icon <https://github.com/OCA/maintainer-tools/blob/master/template/module/static/description/icon.svg>`_.

Contributors
------------

* Serpent Consulting Services Pvt. Ltd. <support@serpentcs.com>

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
