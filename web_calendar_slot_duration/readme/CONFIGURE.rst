This documentation is for developers.

If you want to configure your calendar view's snap duration, make sure that you
action includes a context similar to this (example is the default value)::

    {"calendar_slot_duration": "00:30:00"}

In addition, you can also configure the calendar view's default mode by adding::

    {"calendar_slot_duration": "00:30:00", "keep_default_view_slot_duration": True}

The ``keep_default_view_slot_duration`` key is optional and defaults to ``False``.
When set to ``True``, the calendar view will not adapt its view to the slot size.

For example, if you want to set the default slot duration to 1 hour and 30 minutes,
by default the calendar view will adapt its view to show slots of 1 hour and 30 minutes.
Sometimes this is not desired, for example when you want to show every time slots by hour.

It can be added in actions defined on python or as ``ir.actions.act_window``
records.
