.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :alt: License: AGPL-3

CKEditor web widget
===================

This addon provides a widget for editing html fields via CKEditor 4.6.6

Configuration
=============

In your view definition, use widget="text_html" if you need just html display.
In the unlikely case you need specific features of ckeditor,
use widget="text_ckeditor4".

Known issues / Roadmap
======================

* This version of CKEditor contains a patch that prevents the referencing of
the editor's iframe if it has already been cleaned up by Odoo. In 8.0, this is
the case if the editor was created in an x2many popup. The patch was proposed
as https://github.com/ckeditor/ckeditor-dev/pull/200

Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/web/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us smashing it by providing a detailed and welcomed feedback
`here <https://github.com/OCA/web/issues/new?body=module:%20web_ckeditor4%0Aversion:%201.1%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_.

Credits
=======

CKEditor 4.4.6 Copyright (C) 2003-2015 CKSource - Frederico Knabben

Contributors
------------

* Holger Brunn <hbrunn@therp.nl>
* Stefan Rijnhart <stefan@therp.nl>

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
