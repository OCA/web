.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :alt: License: AGPL-3

=====================================
Display images and icons in tree view
=====================================

This module defines a tree image widget, to be used with either binary fields
or (function) fields of type character. Use ``widget='image'`` in your view
definition. Optionally, set a ``height`` attribute. Default height is 16px.

If you use the widget with a character field, the content of the field can be
any of the following:

* The absolute or relative location of an image. For example,
  "/<module>/static/src/img/youricon.png"

* A standard icon from the web distribution, without path or extension, For
  example, 'gtk-open'

* A dynamic image in a data url base 64 format. Prefix with
  'data:image/png;base64,'

Usage
=====

This module defines a new widget type for tree views columns.

Set the attribute ``widget=image`` in a ``field`` tag in a tree view.
You can also set ``height=<height>`` to set the height the image will have.
Note that this just sets the image ``height`` attribute,
if you want to make the server return a resized image, maybe to reduce the size
of the transferred file or to have uniform images, use the
``resize="<width>,<height>"`` attribute.

You can set ``display=icon`` in order to get a clickable picture icon that will
open a full screen preview of the image. Set ``display=thumbnail`` to get a
clickable thumbnail.

Credits
=======

Contributors
------------

* Stefan Rijnhart
* Leonardo Donelli <donelli@webmonks.it>

Maintainer
----------

.. image:: https://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: https://odoo-community.org

This module is maintained by the OCA.
