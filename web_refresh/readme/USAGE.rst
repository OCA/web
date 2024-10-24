* Single click on refresh button just reloads current view.
* Long click/tap on refresh button opens submenu with two options:

.. image:: ./static/description/options.png

* These options are managed per `webclient action`. So you can enable / disable them independently on each menu item.
  Switching view (i.e. between list/kanban/form) doesn't change options.

Refresh every N sec

* You can configure individual period for reloading. Default and minimum allowed values are handled by Administrator.

.. image:: ./static/description/every.png

* If view is in edit mode when automatic reloading is postponed until you are back to readonly mode.

.. image:: ./static/description/blocked.png

Refresh on server changes

* If user activates option `Refresh on server changes` then odoo will check for server changes in background.
  And immediately reload current view when current data is modified.
* This feature earns much server resources. So it is disabled by default.
  Ask your Administrator to enable it.

.. image:: ./static/description/watching.gif
