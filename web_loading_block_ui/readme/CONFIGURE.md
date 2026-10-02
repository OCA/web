The delay before the screen is blocked is stored in the system parameter
`web_loading_block_ui.delay`, expressed in milliseconds and counted from the
moment the first request starts. The default value is `3000`, which matches
the behaviour of Odoo 16.0 and earlier.

To change it, enable developer mode and go to *Settings > Technical > System
Parameters*. Set the value to `0` to block the screen as soon as a request
starts. Users need to reload the page for a new value to be applied.
