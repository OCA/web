This module allows administrators to mark specific actions as **desktop only**,
so their associated menu entries are automatically hidden on small-screen
(mobile) devices. No Python logic is needed at runtime on mobile: the
filtering happens entirely on the frontend via a patch to the menu service.

It also introduces a **main action** flag that designates the primary entry
point of an application. When some child menus are hidden on mobile, the app
automatically redirects to the first child marked as main action.

Both flags are supported on any action type (``ir.actions.act_window``,
``ir.actions.client``, ``ir.actions.report``, etc.) because they are added to
the base ``ir.actions.actions`` model.

**Typical use case:** An ERP module has sub-menus for a real-time map
(desktop only), a complex dashboard (desktop only), and a summary list
(available everywhere). On mobile, only the summary list is shown and becomes
the app's landing page. On desktop, all menus work normally.

> **Note:** If an app has children and *all* of them are marked as
> ``desktop_only`` with *no* ``main_action`` sibling, the entire app entry is
> hidden on mobile rather than showing a broken landing page.
