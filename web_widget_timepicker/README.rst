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

* By default the possible selection is based on 15 minute interval (step: 15)
* By default 24 hour mode with H:i format (timeFormat: 'H:i')
* By default scroll selection starts at current time (scrollDefault: 'now')

The widget uses the jquery.timepicker plugin by Jon Thornton


Usage
=====

This module defines a new widget type for form views input fileds.
Set the attribute ``widget=timepicker`` in a ``field`` tag in a form view.

You can pass custom options through the "timepicker" field in the options attribute:

    ...
    <field name="mytimefieldname" `widget=timepicker`` options="{'step': '30', 'disableTextInput': false}"/>
    ...

See the available options at https://github.com/jonthornton/jquery-timepicker#timepicker-plugin-for-jquery.


Known issues / Roadmap
======================

* Absolutely no sanity check or validation on options.


Credits
=======

Jon Thornton (https://cdnjs.com/libraries/jquery-timepicker)
jquery.timepicker plugin - This software is made available under the open source MIT License. © 2014 Jon Thornton and contributors

Odoo Community Association (OCA)


Contributors
------------

* Michael Fried
