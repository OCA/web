.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :alt: License: AGPL-3

Raise warning when saving
=========================

This module was written to extend the functionality of saving a record in the web interface.

/!\\/!\\/!\\

In no way this module stops the save of the record. You must consider this as a warning displayed 
to the user AFTER save completed.

/!\\/!\\/!\\

If you don't want OpenERP to save the record, you should use constraints.

Usage
=====

To use this module, you need to:

* write a method called 'check_warning_on_save' which will make some checks and return a string

example :

.. code:: python

    def check_warning_on_save(self, cr, uid, id, context=None):
        """
            @param: int: record_id
            @return: string: message that should be displayed to the user
        """
        res = ""

        record = self.browse(cr, uid, id, context=context)
        # ... make some checks

        return res

For further information, please visit:

* https://www.odoo.com/forum/help-1


Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/{project_repo}/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us smashing it by providing a detailed and welcomed feedback
`here <https://github.com/OCA/web/issues/new?body=module:%20web_warning_on_save%0Aversion:%207.0%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_.


Credits
=======

Contributors
------------

* Damien Crier <damien.crier@camptocamp.com>
* Vincent Renaville <vincent.renaville@camptocamp.com>

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

