Odoo Client Proxy

This module is used to add support to cache POST/GET requests. Can handle Odoo requests and responses to give an offline experience.

We recommend using chrome or chromium based browsers. See Roadmap section.

Cache Types
~~~~~~~~~~~

- Model -> Gets records, related actions, views, default values and filters
- Client QWeb -> Gets indepent client views (used by widgets)
- function -> Cache function calls
- Onchange -> Cache onchange calls
- Onchange with formula -> Cache onchange calls using formulas (async)
- Default with formula -> Cache default values using formulas
- Post -> Cache indepent POST requests (used by widgets)
- Get -> Cache indepent GET requests

** THIS SECTION NEEDS MORE INFORMATION **

How Works
~~~~~~~~~

The module handle two modes:

- Normal: Runs Odoo as normal
- Standalone: When the app starts you will request to set the mode (offline or online).
    - Online: All requests except Create, Update and Delete operations goes from cache first, if not found, tries from network.
    - Offline: All requests goes from/to cache

When the user change to online mode the module will start to prefetch all data and only recent records will be requested (write_date > last_cache_date)

The standalone mode is available only when install the PWA.
Note that we call 'PWA' to the 'Home Icon'. The ServiceWorker is installed and activated automatically when the user access to the backend.
The service worker will always listen for all fetch events sent from the controlled page. If the user is not in the 'Enable PWA Cache' group or is not
in 'standalone' mode, the request will be handled normally (directly to the network without checking for possible cached responses).
This operation adds an overhead of ~3ms per request. It is not possible to skip this "routing" due to the way the service worker works.

This module uses queue_job to precalculate the onchanges following the rules defined in the pwa.cache model. You can see the records in the 'Technical'
menu. Always you can force this precalculations using the button available in the pwa.cache record form.

To Developers
~~~~~~~~~~~~~

'onchange' prefetching works in a generic way... so, it uses the "main" form view to know the involved fields. If you trigger an onchange than uses a
field thas is not present in this view, you won't get any change related to the field.
