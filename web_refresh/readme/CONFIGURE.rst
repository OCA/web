* This module adds two options at the bottom of "`General Settings`".
  Here you can enable / disable each option for all internal users in the database.

.. image:: ./static/description/administration.png

* There are trick to enable / disable these options per user.
  To do it go to user group management and enable / disable groups
  "`Allow periodic refresh`" and "`Allow refresh on server changes`" accordingly for each user.
  Note that for "`Allow refresh on server changes`" feature you must enable this group for
  Administrator (SUPERUSERID) obligatorily to make this feature worked for any other user.
* **Warning!** "`Reload on server changes`" feature earns much server resources. So it is disabled by default.
  Enabling this feature can increase server load by 2-5 times.
  Disable it if you have performance issues.
