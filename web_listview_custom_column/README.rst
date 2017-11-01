.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
    :alt: License: AGPL-3

==========================
Custom columns in listview
==========================

This module was written to allow users to rearrange columns in list views. This can be done organization wide or just for the user herself.

Configuration
=============

To configure this module, you need to add users supposed to be able to customize columns to the group `Customize list views`. Note that this permission allows all sorts of mischief up to privilege escalation under certain circumstances, so this is only for trusted users.

Usage
=====

To use this module, you need to:

#. go to some list and click the columns symbol left of the view switcher
#. use the buttons appearing in column headers to remove and rearrange columns
#. use the dropdown appearing next to the columns symbol to add columns
#. use the person or group symbols next to the dropdown to switch between for whom you customize
#. use the cross next to those to delete your customization. If there's a customization both for yourself and everyone, the first reset will put you on the customization for everyone, and the second will delete the customization for everyone

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
    :alt: Try me on Runbot
    :target: https://runbot.odoo-community.org/runbot/162/8.0

Known issues
============

- this addon creates standard view overrides. Those are created with priority 10000 to avoid side effects, but the views will break if you remove fields from the database. Uninstalling the module will remove all view customizations.
- when rearranging columns, invisible columns count. So if it seems like nothing happens, you'll probably have some invisible columns

Roadmap
=======

- support some kind of group level customization
- allow sharing customizations with others

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

* Holger Brunn <hbrunn@therp.nl>

Do not contact contributors directly about help with questions or problems concerning this addon, but use the `community mailing list <mailto:community@mail.odoo.com>`_ or the `appropriate specialized mailinglist <https://odoo-community.org/groups>`_ for help, and the bug tracker linked in `Bug Tracker`_ above for technical issues.

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
