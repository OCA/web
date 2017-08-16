.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl
   :alt: License: AGPL-3

===================================================
Slick Carousel Widget with DarkroomJS Image Editing
===================================================

This module extends the `Slick`_ carousel widget provided by
`web_widget_slick` to include the `DarkroomJS`_ image editing features provided
by `web_widget_darkroom`.

.. _Slick: http://kenwheeler.github.io/slick
.. _DarkroomJS: https://github.com/MattKetmo/darkroomjs

Usage
=====

To create a Slick carousel widget with DarkroomJS support, follow the
usage instructions in the `web_widget_slick` documentation, but replace
"one2many_slick_images" with "slickroom" in the field definition, as shown
here::

    <field name="image_ids" widget="slickroom" options="{}"/>

To edit an image in a carousel, simply click the Edit button in the form view,
then click on the image you wish to edit to open a DarkroomJS modal. Edit the
image as desired according to the `web_widget_darkroom` documentation, and
click Save to save the changes and update the carousel.

Example Module
--------------

An example implementation, for instructional purposes as well as convenient
functional testing, is provided in the `web_widget_slick_example` module.

* Install `web_widget_slick_example`.
* Activate Developer Mode.
* Go to Settings / Technical / Slick, and open the record.
* The standard Slick carousel widget (from `web_widget_slick`) is displayed on
  top, followed by the slickroom widget with DarkroomJS support. Click the Edit
  button in the form view to try out the DarkroomJS features.

To try out different Slick settings:

* Go to Settings/User Interface/Views and search for 'slick.example.view.form'.
* Open the form view record.
* Click the Edit button.
* In the Architecture editor, find `options="{'slidesToShow': 2}`, and add
  any desired settings (separated by commas) inside the curly braces.
* Save the changes and browse to the widget, as described above, to see the
  widget with the new settings in effect.

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/162/10.0

Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/web/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smash it by providing detailed and welcomed feedback.

Credits
=======

Images
------

* Odoo Community Association: `Icon <https://github.com/OCA/maintainer-tools/blob/master/template/module/static/description/icon.svg>`_.

Contributors
------------

* Brent Hughes <brent.hughes@laslabs.com>

Do not contact contributors directly about support or help with technical issues.

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
