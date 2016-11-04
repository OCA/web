.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

==============================
Custom shortcut icon (favicon)
==============================

This module was written to allow you to customize your Odoo instance's shortcut
icon (aka favicon). This is useful for branding purposes, but also for
integrators who have many different Odoo instances running and need to see at a
glance which browser tab does what.

More info about favicon: https://en.wikipedia.org/wiki/Favicon

Configuration
=============

Upload your favicon (16x16, 32x32, 64x64 or "as big as possible") on the
company form. The file format would be ico, gif or png with 16x16, 32x32 or
64x64 pixels and 16 colors. Highers resolutions or colors support depends on
the used browser, but most modern browsers do.

Note that most browsers cache favicons basically forever, so if you want your
icon to show up, you'll most probably have to delete you browser cache.
Some browsers can refresh the favicon, accessing the URL
<base_url>/web_favicon/favicon.

You have a sample SVG that can be used as template for generating your icon
in /static/src/img/master_original_favicon.svg. You can also search for some
favicon generators across the web.

Usage
=====

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
    :alt: Try me on Runbot
    :target: https://runbot.odoo-community.org/runbot/162/9.0

Known issues / Roadmap
======================

* Allow to upload some big icon (preferrably SVG or the like) and generate
  all the icons from it
* Generate icons suitable for mobile devices and web apps (see /static/src/img/
  folder inside the module for a sample of the possible current formats.
* Put the icon definition at system level, not at company level. It doesn't
  make sense (as the icon is cached) to have a different icon per company.

Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/web/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us smashing it by providing a detailed and welcomed feedback
`here <https://github.com/OCA/web/issues/new?body=module:%20
web_favicon%0Aversion:%20
10.0%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_.

Credits
=======

Contributors
------------

* Holger Brunn <hbrunn@therp.nl>
* Pedro M. Baeza <pedro.baeza@gmail.com>

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
