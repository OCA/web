.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
    :alt: License: AGPL-3

=========================
Filters for x2many fields
=========================

This module was written to allow developers to add filter buttons to an x2many field.

.. image:: /web_x2m_filter/static/description/screenshot.png
    :alt: Screenshot

Usage
=====

To use this module, you need to:

#. add a key ``web_x2m_filter`` to the field's ``options`` dictionary
#. this key should contain a list if dictionaries which describe a button by the properties ``name`` and ``domain``::
   
        {'web_x2m_filter': [{'name': 'Only admins', 'domain': [('groups_id', '=', %(base.group_erp_manager)s)]}]}
#. to have one filter being active on form load, add a key named ``default`` with value ``True``
#. the string in ``name`` is subject to the standard translation mechanism
#. the domain is evaluated with the user's context and the current form values

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
    :alt: Try me on Runbot
    :target: https://runbot.odoo-community.org/runbot/162/8.0

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
