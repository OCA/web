In standard Odoo, pivot views format all monetary fields with the same number of
decimal places, regardless of the currency associated with each record. For example,
Japanese Yen (JPY) values that should display as whole numbers (e.g. "1,000") are shown
with unnecessary decimals (e.g. "1,000.00").

This module patches the pivot view to respect the `currency_digits` attribute of
monetary fields so that each cell is formatted according to its currency's rounding
precision.

Note: This module does not need to be migrated to Odoo 19, as the core now covers this
functionality.
