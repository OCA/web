Description
-----------

Allows all rows to be exported from a search view including
the ones not on the current page. Data is streamed back from
the server to prevent timeouts and memory issues when exporting
many records.

How to Use
----------

In order to export all records as found in your search query,
through the usual export dialogue, select "All Rows" from
the "Export Selection" field.

Notes
-----

From Odoo 8.0 it is possible to export all records by selecting
none and using the export dialogue. This data is not streamed
which may cause a timeout, or much worse, the server to run out
of memory.
