.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :alt: License: AGPL-3

==============================
Timepicker widget in form view
==============================

This module defines a timepicker widget, to be used with float fields
or (function) fields. Use ``widget='timepicker'`` in your form view
definition. It can be use as a replacement for the standard float_time widget.

If you use the widget with a field record, the input field has the following default
timepicker options:

* By default direct user input is disabled
* By default the possible selection is based on 15 minute interval
* By default 24 hour mode with H:i format
* Scroll selection defaults to current server time

The widget uses the jquery.timepicker plugin by Jon Thornton


Usage
=====

This module defines a new widget type for form views input fileds.

Set the attribute ``widget=timepicker`` in a ``field`` tag in a form view.

You can pass all options through the "timepicker" field in the options::

    ...
    <field name="mytimefieldname" `widget=timepicker`` options="{'step': '15', 'disableTextInput': false}"/>
    ...

See the available options at https://github.com/jonthornton/jquery-timepicker#timepicker-plugin-for-jquery


ToDo
====

Sanity check on options available in field defintion as override options for timepicker widget.


Credits
=======

Jon Thornton (https://cdnjs.com/libraries/jquery-timepicker)
jquery.timepicker plugin - This software is made available under the open source MIT License. © 2014 Jon Thornton and contributors

Odoo Community Association (OCA)


Contributors
------------

* Michael Fried
