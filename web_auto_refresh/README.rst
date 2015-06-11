.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :alt: License: AGPL-3

Web Auto Refresh
===========

Standard odoo does not support auto refresh the inbox message, kanban and list view when underlying model data updated by others, even though there is auto refresh option in ir.actions.act_window, this only works for old GUI client(version < 7.0). for inbound message, orders, tickets etc auto refresh function will be very useful.
and allow you to ...

Installation
============

To install this module, you need to:

* get the dependency module bus_enhanced from either the original author's repository https://bitbucket.org/anybox/bus_enhanced/ or the cloned version in OCA\web

Configuration
=============

To configure this module, you need to:

* for inbox message auto refresh, no configuration needed
* for kanban and list view auto refresh, 
go to setting->technical->actions->window actions, find the desired action, set auto refresh parameter(>0 is enough) 

Usage
=====

To use this module, you need to:

* For kanban and list view
    1. goes to the list or kanban view of the selected model, in display mode
    2. in another session(login via another browser and other computer), create, change or delete records of the model, then save
    3. the original list or kanban view in display mode will be auto refreshed
    
* For inbox message/ mail wall auto refresh
    1. login to system and stay at the initial inbox screen, in display mode( do not invoke the compose message)
    2. from another session, create internal message on documents which you are the follower
    3. the inbox message will be auto refreshed
    
    
For further information, please visit:

* https://www.odoo.com/forum/help-1

Known issues / Roadmap
======================

* From Techical point of view, the high level implementation detail is as following
    1. on backend(Python), generate one record into model bus.bus(notification) when relevant model data updated(create/write/unlink) by calling the bus.sendone('channel','message') in overwritten method create/write/unlink
    2. on frontend(javascript), declare the event listener to handle the notification message, check to see whether the notification(message)  is relevant for the current view/ user, if so auto refresh the view, either call reload(),do_reload(), or do_search_view_search()
    
* This module is designed as a generic solution, if only limited models need this kind of auto refresh function, in     order to reduce the extra overhead(every call to create/write/unlink need to check whether notificaiton to be generated) introduced by this module, it is suggested to enhance the individual module accordingly.

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

* Fisher Yu <szufisher@gmail.com>

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

