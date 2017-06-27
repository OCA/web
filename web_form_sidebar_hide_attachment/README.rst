.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

================================
Web Form Sidebar Hide Attachment
================================

This module allows to hide attachment sidebar on specific form views.

Installation
============

This module depends on document.

Usage
=====

To use this module, you need to add an attribute on form views:

.. code-block:: xml

   <form string="Partners" attachment_sidebar="false">

or

.. code-block:: xml

   <form string="Partners" attachment_sidebar="0">


Known issues / Roadmap
======================

* Allow to define a parameter/property on a model to disable the attachment sidebar of all form views which belongs to the model.
* Allow to use a condition depending on the current record values.

Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/{project_repo}/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smashing it by providing a detailed and welcomed feedback.

Credits
=======

Images
------

* Odoo Community Association: `Icon <https://github.com/OCA/maintainer-tools/blob/master/template/module/static/description/icon.svg>`_.

Contributors
------------

* Benjamin Willig <benjamin.willig@acsone.eu>

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
