Creating a contextual action does not make it appear in the **Actions** menu of
the model it is bound to.

The toolbar of a view is built server side from the action bindings and travels
inside the `get_views` response. Since 19.0 the web client serves that response
from a cache persisted in IndexedDB, and invalidates it for `ir.ui.view` and
`ir.filters` only. `ir.actions.server` is not in that list, and the *Create
Contextual Action* / *Remove Contextual Action* buttons call `create_action` and
`unlink_action` through `call_button`, so they are not in `UPDATE_METHODS`
either. Binding an action therefore never invalidates the cached `get_views`.

In 18.0 the same cache was a plain in-memory object rebuilt on every page load,
so a refresh hid the missing invalidation.

This module adds the missing invalidation for the action models, so a newly bound
action shows up straight away.

It patches nothing in core: `rpcBus` is exported by `@web/core/network/rpc` and
the `CLEAR-CACHES` event is already consumed there, so the module only publishes
the event core does not publish for the action models.

Odoo was asked to do this in core in [odoo/odoo#286419](https://github.com/odoo/odoo/pull/286419) and
[declined](https://github.com/odoo/odoo/pull/286419#issuecomment-5525722682), answering that reloading the webclient is the expected
behaviour and that creating a server action is too rare a flow to justify the
extra code. This module is for the installations that would rather not reload.
