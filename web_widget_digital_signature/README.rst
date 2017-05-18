.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :alt: License: AGPL-3

Web Widget Digital Signature
==================================

Description
-----------

This module was written to extend the functionality of binary field to support
digital signature in openerp. It will allow you to add digital signature.

There are certain occasions where you need to add the signature on display
(like banking sector), on reports when sending digital papers/statements/
documents/invoices in order to avoid physical efforts. This module fills
the gap at certain extent and by providing basic Signature Widget.

Usage
------------

To use this module, you need to:

- Add a binary field to your model.
- Add " widget = 'signature' " attribute inside your binary field definition (XML).

Your XML form view definition will look a like:

    ...
    <field name="YOUR_BINARY_FIELD" widget="signature"/>
    ...

It will display binary field as a signature.

For further information, please visit:

https://www.odoo.com/forum/help-1


Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/web/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us smashing it by providing a detailed and welcomed feedback
`here <https://github.com/OCA/web/issues/new?body=module:%20web_widget_digital_signature%0Aversion:%207.0%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_.

Credits
=======

Contributors
------------

* Jay Vora <jay.vora@serpentcs.com>
* Meet Dholakia <m.dholakia.serpentcs@gmail.com>

Maintainer
----------

.. image:: http://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: http://odoo-community.org

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose
mission is to support the collaborative development of Odoo features and
promote its widespread use.

To contribute to this module, please visit http://odoo-community.org.
