## Marking an action as desktop only

In your XML data file, set the ``desktop_only`` field to ``True`` on any
action record:

```xml
<record id="action_complex_dashboard" model="ir.actions.act_window">
    <field name="name">Complex Dashboard</field>
    <field name="res_model">my.model</field>
    <field name="view_mode">kanban,list,form</field>
    <field name="desktop_only">True</field>
</record>
```

The same flag is available on client actions:

```xml
<record id="action_realtime_map" model="ir.actions.client">
    <field name="name">Real-time Map</field>
    <field name="tag">my_module.RealTimeMap</field>
    <field name="desktop_only">True</field>
</record>
```

This menu entry will be visible on desktop browsers but hidden on mobile
devices. The field is available on all action types (``ir.actions.act_window``,
``ir.actions.client``, ``ir.actions.report``, etc.) because it is defined on
the base ``ir.actions.actions`` model.

## Designating a main action

When you hide some menus on mobile, the parent app may lose its default entry
point. Mark one of the remaining (non-hidden) actions as ``main_action`` so
the app knows where to redirect mobile users:

```xml
<record id="action_summary_list" model="ir.actions.act_window">
    <field name="name">Summary List</field>
    <field name="res_model">my.model</field>
    <field name="view_mode">list,form</field>
    <field name="main_action">True</field>
</record>
```

> **Important:** If every child menu of an app is marked as ``desktop_only``
> and none carries ``main_action``, the whole app will be hidden on mobile
> instead of landing on a broken or empty screen.

## How it works

On small screens the frontend menu service filters out child menus whose
action has ``desktop_only = True``. If any children were removed, the app's
default action is reassigned to the first visible child marked with
``main_action = True``. If no such child exists, the entire app is hidden on
mobile.

The flags are loaded server-side by ``ir.ui.menu.load_web_menus`` and
exposed as ``desktopOnly`` / ``mainAction`` properties in the menu payload, so
the filtering logic runs fully on the client without additional RPC calls.
