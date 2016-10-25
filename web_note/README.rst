.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

==============
Web Note
==============

This module can be used for adding a notes field in any module that need them.
There are three type of notes - private, internal, external. 
Only the user that create a private note can see it. The other two types can be used for creating different views.

Usage
=====

To use this module, you need to:

 * Add dependencie to 'web_note' in the __openerp__.py file of the module in which you need the webnotes(your module).
 * inherit the web.note class and add many2one field connected with your model
 * in your model create one2many field to web.note model
 * add the field in the view you want

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

* Nikolina Todorova <nikolina.todorova@initos.com>

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

