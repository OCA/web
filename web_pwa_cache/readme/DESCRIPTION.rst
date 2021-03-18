Odoo Client Proxy

This module is used to add support to cache POST/GET requests. Can handle Odoo requests and responses to give an offline experience.

Cache Types
~~~~~~~~~~~

- Model -> Gets records, related actions, views, default values and filters
- Client QWeb -> Gets indepent client views (used by widgets)
- function -> Cache function calls
- Onchange -> Cache onchange calls
- Onchange with formula -> Cache onchange calls using formulas
- Post -> Cache indepent POST requests (used by widgets)
- Get -> Cache indepent GET requests

How Works
~~~~~~~~~

The module handle two modes:

- Normal: Runs Odoo as normal
- Standalone: When the app starts you will request to set the mode (offline or online).
    - Online: All requests except Create, Update and Delete operations goes from cache first, if not found, tries from network.
    - Offline: All requests goes from/to cache

When the user change to offline mode the module will start to prefetch all data and only recent records will be requested (write_date > last_cache_date)

The standalone mode is available only when install the PWA.

To Developers
~~~~~~~~~~~~~

'onchange' prefetching works in a generic way... so, it uses the "main" form view to know the involved fields. If you trigger an onchange than uses a
field thas is not present in this view, you will don't get any change related with the field.

If you want trigger an 'onchange' with
