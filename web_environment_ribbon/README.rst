.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

======================
Web Environment Ribbon
======================

Mark a Test Environment with a red ribbon on the top left corner in every page

.. image:: /web_environment_ribbon/static/description/screenshot.png
    :alt: Screenshot

Installation
============

No special setup

Configuration
=============

* You can change the ribbon's name ("TEST") by editing the default system
  parameter "ribbon.name" (in the menu Settings > Parameters > System
  Parameters) To hide the ribbon, set this parameter to "False" or delete it.
* You can customize the ribbon color and background color through system
  parameters: "ribbon.color", "ribbon.background.color". Fill with valid CSS
  colors or just set to "False" to use default values.

Usage
=====

To use this module, you need only to install it. After installation, a red
ribbon will be visible on top left corner of every Odoo backend page

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/162/9.0

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

* Francesco Apruzzese <cescoap@gmail.com>
* Javi Melendez <javimelex@gmail.com>
* Antonio Espinosa <antonio.espinosa@tecnativa.com>

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
