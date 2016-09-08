
.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :alt: License: AGPL-3

Help Popup
===========

This module adds an html help popup on each model action. 
It brings to end users inline documentation.
Some parts of the documentation can be modified by anyone (with proper rights).


Configuration
=============

* Go to any view and click on the `?` near the title view.
* Edit the html field to add content


* You can provide documentation with this module by appending data 
  in the field advanced_help (relative to action) or advanced_help_model
  if your help must be associated to model instead of action


Usage
=====

Click on ? button


.. image:: help_popup/static/description/popup.png
    :alt: License: Help Popup


Alternative
-----------
If you have website module installed, it could be an option
to install help_online instead of this module.

Help Online is more advanced (allow the end user to add help)
but depends on an other module.
Help popup is more like an embedded help that use power users for end users.


Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/web/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us smashing it by providing a detailed and welcomed feedback
`here <https://github.com/OCA/web/issues/new?body=module:%20web%0Aversion:%200.5%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_.


Credits
=======

Contributors
------------

* Sylvain Calador <sylvain.calador@akretion.com>
* David Beal <david.beal@akretion.com>


Icons
------
https://www.iconfinder.com/Vecteezy


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
