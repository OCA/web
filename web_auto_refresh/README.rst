.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :alt: License: AGPL-3

Web Auto Refresh
===========

Standard odoo 10.0 only support auto refreshing the inbox message, for kanban and list view when underlying model data updated by others, even though the auto search option in ir.actions.act_window activated, system will not auto refresh the kanban and list view as expected, this small moddue just fills this gap, this module is useful for keep monitoring orders, tickets etc without manual refresh the browser.


Installation
============

To install this module, you need to:


Configuration
=============

To configure this module, you need to:

1. go to setting->technical->actions->window actions, find the desired action, activate the auto search Check box
2. add one automated action for the target model , in the linked server action add the following python code, this automated action can be applied(when to run) to creation, update or delete per your requirement
    model.env['bus.bus'].sendone('auto_refresh', model._name)


Usage
=====

To use this module, you need to:

    1. goes to the list or kanban view of the selected model, in display mode
    2. in another session(login via another browser and other computer), create, change or delete records of the model, then save
    3. the original list or kanban view in display mode will be auto refreshed
           
For further information, please visit:

* https://www.odoo.com/forum/help-1

Known issues / Roadmap
======================

* From Techical point of view, the high level implementation detail is as following
    1. on backend(Python code triggered by automated server action), generate one record into model bus.bus(notification) when relevant model data updated(create/write/unlink) by calling the bus.sendone('channel','message')
    2. on frontend(javascript), declare the event listener to handle the notification message, check to see whether the notification(message)  is relevant for the current view/ user, if so auto refresh the view, either call reload(),do_reload(), or do_search_view_search()    

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

