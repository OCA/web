.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :target: https://www.gnu.org/licenses/agpl-3.0-standalone.html
    :alt: License: AGPL-3

===================
Drop target support
===================

This module extends the functionality of the web client to support dropping local files into the web client.

By default, an attachment will be created when dropping a file on a form.

Further, this module is meant as a base drag&drop module supporting other actions after some file is dropped so that other modules can add more features.

Usage
=====

To use this module, you need to:

#. drag a file from your local computer onto an Odoo form view
#. it should become an attachment of the currently opened record

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
    :alt: Try me on Runbot
    :target: https://runbot.odoo-community.org/runbot/162/11.0

Known issues / Roadmap
======================

* dropping on list or kanban views would be nice too
* handle multiple files
* add an upload progress meter for huge files
* trigger custom events about different stages of the drop operation for other addons to hook in
* Install document module to display attachments in the sidebar

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

Libraries
---------

* `base64js <https://raw.githubusercontent.com/beatgammit/base64-js>`_.

Contributors
------------

* Holger Brunn <hbrunn@therp.nl>
* Akim Juillerat <akim.juillerat@camptocamp.com>

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
