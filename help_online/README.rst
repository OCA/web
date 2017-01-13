.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
    :alt: License: AGPL-3

===========
Help Online
===========


This module allows the creation of an online help available from the lists
and forms in Odoo.

When loading a view, the module generates a button allowing access to an help
page for the related model if the page exists and the user is member of the
group 'Help reader'. If the page doesn't exist and the user is member of
the group 'Help writer', the module generate a button allowing the creation an
help page.

The help pages are created and managed via the website Module.

Note: When updating the page prefix parameters, the record rules must be
      adapted.

Usage
=====

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/162/10.0


Known issues / Roadmap
======================

Even if the generated  urls to the documentation contains an anchor (website/hel-xx#view_type),
it's no more possible to insert/edit anchors elements into the website since this functionnality is not supported
by the new html editor in Odoo 10.0 (summernote).


Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/web/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smashing it by providing a detailed and welcomed feedback.

Credits
=======

Contributors
------------

* Laurent Mignon <laurent.mignon@acsone.eu>
* Jonathan Nemry <jonathan.nemry@acsone.eu>
* Cédric Pigeon <cedric.pigeon@acsone.eu>

Maintainer
----------

.. image:: https://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: https://odoo-community.org

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose mission is to support the collaborative development of Odoo features and promote its widespread use.

To contribute to this module, please visit https://odoo-community.org.
