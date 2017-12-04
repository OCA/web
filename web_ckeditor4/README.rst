.. image:: https://img.shields.io/badge/license-AGPL--3-blue.png
   :target: https://www.gnu.org/licenses/agpl
   :alt: License: AGPL-3

===================
CKEditor web widget
===================

This module introduces the text_ckeditor4 widget that when used allows the user
to use specific features of ckeditor.

Usage
=====

To use this module, you need to:

#. Go to ...

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/162/10.0

Known issues / Roadmap
======================

* This version of CKEditor contains a patch that prevents the referencing of
  the editor's iframe if it has already been cleaned up by Odoo. In 8.0, this is
  the case if the editor was created in an x2many popup. The patch was proposed
  as https://github.com/ckeditor/ckeditor-dev/pull/200

Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/{project_repo}/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smash it by providing detailed and welcomed feedback.

Credits
=======

Images
------

* Odoo Community Association: `Icon <https://odoo-community.org/logo.png>`_.

Contributors
------------
* Holger Brunn <hbrunn@therp.nl>                                               
* Stefan Rijnhart <stefan@therp.nl>                                            
* George Daramouskas <gdaramouskas@therp.nl> 

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
