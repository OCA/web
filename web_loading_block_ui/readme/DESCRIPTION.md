Since Odoo 17.0 the loading indicator is a small badge in the bottom right
corner of the screen and the user interface keeps accepting input while a
request is still running. Odoo 16.0 and earlier blocked the whole screen with
a blurred overlay and a centered spinner when a request took longer than a few
seconds.

This module restores that behaviour on top of the current loading indicator:
when a request stays pending for longer than a configurable delay, the screen
is blocked with the standard Odoo overlay (blurred background and centered
"Loading..." spinner) until every pending request has been answered.
