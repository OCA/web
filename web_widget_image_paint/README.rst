=====================
Image painting widget
=====================


.. image:: https://img.shields.io/badge/license-AGPL--3-blue.png
   :target: https://www.gnu.org/licenses/agpl
   :alt: License: AGPL-3

**Table of contents**

.. contents::
   :local:


Description
===========

This module adds a form view widget that makes it possible to paint and save the resulting picture
into a binary field of the form view model.

The starting image can be a static image, uploaded or retrieved from another binary field.

The painted image can be reset at any time to the predefined static or dynamic image.

The toolbox, based on the Fabrics.js (version 1.7.6) library(cf. http://fabricjs.com/),
has different brushes and markers whereby shape, size, shadow and color can be selected.


Usage
=====

Add the widget to your module as follows:

* __manifest__.py

.. code-block::

   'depends': ['web_widget_image_paint'],

* ORM model

.. code-block::

   my_paint_image = fields.Binary()

* Form View :

.. code-block::

   <field name="my_paint_image"
          widget="image_paint"
          width="500"
          height="650"
          readonly="0"
          background="/my_module/static/img/my_background.png"
          options="{'drawing_mode': True,
                    'edit_background_image': True,
                    'background_image_field': 'my_background_image_field',
                    'add_marker': True,
                    'marker_shape': 'x-sign',
                    'marker_color': 'red',
                    'marker_size': 20}"/>

Options
-------

xml field tag attributes:

* width (default: 500)
* height (default: 376)
* background (default: \web_widget_image_paint\static\src\img\image-placeholder.png)

widget options:

* drawing_mode : True | False (default: True)

  When False the ‘Enter Drawing Mode’ button becomes invisible, hence only moving mode available

* edit_background_image : True | False (default: True)

  Set this option to False if you do not want the end-user to upload his own background image

* background_image_field

  You can specify another binary field on the same model for the background image.

* add_marker : True | False (default: True)

  When False the ‘Add Marker’ button is not available

* marker_shape : x-sign | diamond | circle | square (default: x-sign)

* marker_color (default 'red')

* marker_size (default 20)

Known issues / Roadmap
======================

* Insertion of text
* layers : background + overlay, 2 fields, fusion or merge background and overlay
* only one widget image_paint by view

Credits
=======

Authors
-------

* Pascal Vanderperre <pascal.vanderperre@noviat.com>

Contributors
------------

* Pascal Vanderperre <pascal.vanderperre@noviat.com>
* Benjamin Henquet <benjamin.henquet@noviat.com>
* Luc De Meyer <luc.demeyer@noviat.com>

Maintainers
-----------

This module is maintained by the OCA.

.. image:: https://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: https://odoo-community.org

OCA, or the Odoo Community Association, is a nonprofit organization whose
mission is to support the collaborative development of Odoo features and
promote its widespread use.

This module is part of the `OCA/web <https://github.com/OCA/web>`_ project on GitHub.

You are welcome to contribute. To learn how please visit https://odoo-community.org/page/Contribute.
