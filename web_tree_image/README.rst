Display images and icons in tree view
=====================================

This module defines a tree image widget, to be used with either binary fields
or (function) fields of type character. Use widget='tree_image' in your view
definition. Optionally, set a 'height' tag. Default height is 16px.

If you use the widget with a character field, the content of the field can be
any of the following:

* the absolute or relative location of an image. For example,
  "/<module>/static/src/img/youricon.png"

* a standard icon from the web distribution, without path or extension, For
  example, 'gtk-open'

* A dynamic image in a data url base 64 format. Prefix with
  'data:image/png;base64,'
