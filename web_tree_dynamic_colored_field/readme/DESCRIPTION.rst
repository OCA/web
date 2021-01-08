This module aims to add support for dynamically coloring fields in tree view
according to data in the record.

It provides attributes on fields with the similar syntax as the ``colors`` attribute
in tree tags.

Further, it provides a ``color_field`` attribute on tree tags's ``colors`` to use
a field's value as text color. The same way, the ``background_color_field``
attribute is made to use field's value as background color.

Features
========

* Add attribute ``bg_color`` on field's ``options`` to color background of a cell in tree view
* Add attribute ``fg_color`` on field's ``options`` to change text color of a cell in tree view
* Add attribute ``color_field`` on the tree element's ``colors`` to use as text color
* Add attribute ``background_color_field`` on the tree element's ``colors`` to use as background color
