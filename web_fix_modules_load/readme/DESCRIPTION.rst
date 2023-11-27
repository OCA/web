Odoo loads translations and module info using their names.
When you have a lot of modules installed (eg: 500+)
this can lead to very big GET requests (more than 12k) which, in most of the cases,
will be blocked by the web server (eg: nginx) because they are too big.

This module tries to fix this by using modules' ids instead of names
reducing dramatically the size of such requests.
