=================================================
Revert the changes done on the database 
=================================================

This module allows to revert the database state prior to a certain moment chosen by the user.
It is useful when you test something in Odoo and afterwards want to go back to the initial database state. 

Usage
=====

On the right side of the systray there are two buttons: Activate and Rollback
Press the Activate button (it will turn green), do any changes/actions in odoo (products, pickings, sale orders, etc) and save them.
If you want to undo all the changes, press Rollback button.
The database state will revert to the state prior to pressing Activate button.

The number of Odoo workers has to be 0.

Also note that when you press Rollback button, all the chanages done by other users will be lost.

Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/web/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smash it by providing detailed and welcomed feedback.

Credits
=======

Images
------

* Odoo Community Association: `Icon <https://github.com/OCA/maintainer-tools/blob/master/template/module/static/description/icon.svg>`_.

Contributors
------------

* Marcel Cojocaru <marcel.cojocaru@gmail.com>

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
