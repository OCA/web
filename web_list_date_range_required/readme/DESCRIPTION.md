This module adds a list view type, `date_range_list`, that asks for a date range
before showing any record and then filters the list by that range.

It is meant for models with very large tables (GPS positions, IoT readings, logs...)
where loading every record by default is slow or not possible at all.

The range can be today, yesterday, the last 7 days or a custom range with a
configurable maximum length. When the user switches to another view of the same
action (form, pivot, map...) or comes back through the breadcrumbs, the range is
kept.
