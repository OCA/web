This is a technical module. It doesn't do anything on its own.

Odoo introduced a mechanism to set the desired color for a calendar filter,
through the field's `color` attribute.

Unfortunately, this only works for filters, but not if we want to use the
calendar's `color` attribute.

This module makes the appropiate changes so that the filter's color is used, if available.
