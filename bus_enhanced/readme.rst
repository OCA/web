.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :alt: License: AGPL-3

Bus Enhanced
===========

Enhance standard bus.bus, enable customized event handling.

Installation
============

To install this module, you need to:

*you can check the original author's repository https://bitbucket.org/anybox/bus_enhanced/ 

Configuration
=============

No configuration needed

Usage
=====
* backend(Python): generate one record into model bus.bus(notification) when relevant model data updated(create/write/unlink) by calling the bus.sendone('channel','message') in overwritten method create/write/unlink
*frontend(javascript): declare the event listener to handle the notification message, check to see whether the notification(message)  is relevant for the current view/ user, if so auto refresh the view, either call reload(),do_reload(), or do_search_view_search()
*you can have web_auto_refresh as reference
    
For further information, please visit:

* https://www.odoo.com/forum/help-1

Known issues / Roadmap
======================


Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/{project_repo}/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us smashing it by providing a detailed and welcomed feedback
`here <https://github.com/OCA/{project_repo}/issues/new?body=module:%20{module_name}%0Aversion:%20{version}%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_.


Credits
=======

Contributors
------------

* Jean-Sebastien SUZANNE <jssuzanne@anybox.fr>

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
