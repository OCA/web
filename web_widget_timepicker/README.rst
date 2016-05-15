.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :alt: License: AGPL-3

==============================
Timepicker widget in form view
==============================

This module defines a timepicker widget, to be used with either char fields
or (function) fields of type character. Use ``widget='timepicker'`` in your form view
definition.

If you use the widget with a character field, the input field has the following default
timepicker options:

* By default direct input is disabled
* By default the possible selection is based on 15 minute interval
* By default 24 hour mode with H:i format
* Scroll selection defaults to current server time

The widget uses the jquery.timepicker plugin by Jon  Thornton


Usage
=====

This module defines a new widget type for form views input fileds.

Set the attribute ``widget=timepicker`` in a ``field`` tag in a form view.


ToDo
====

Make timepicker options available in field defintion as additional attributes / options.


Credits
=======

Jon Thornton (jquery.timepicker plugin)
jquery.timepicker plugin - This software is made available under the open source MIT License. © 2014 Jon Thornton and contributors

Odoo Community Association (OCA)


Contributors
------------

* Michael Fried

