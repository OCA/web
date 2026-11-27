Ensure that assets are generated and stored in the DB when Odoo starts

If the assets from the database are not up-to-date, they are regenerated
by Odoo when we print a report, but to do so Odoo forces the commit, so
if an exception occurs after (or during) the report rendering, it let
the database in a broken state (picking have been validated in this
case).

To prevent this issue, we need to ensure that the assets are
well-generated when Odoo starts, not when the report is printed.
