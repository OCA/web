To show a filter in the header of the views, it should have the a `context` attribute with the key `shown_in_panel`.

```xml
<filter
    string="My filter"
    name="my_filter"
    domain="[('active', '!=', False)]"
    context="{'shown_in_panel': True}"
>
```

This will show the filter in the header with its name. You can customize the button
adding an icon or with a custom name passing an object to that key:

```python
{'shown_in_panel': {'icon': 'thumb_up', 'name': 'Ok'}}
```

The icon is the name of an icon of the Odoo icon font (Material Symbols), the same
value used in the `data-icon` attribute of the `oi` icons (e.g.: `thumb_up`,
`toggle_on`, `business`...).

Extra classes for the icon can be set with the `iconClass` property. For example, to
show the filled variant of the icon:

```python
{'shown_in_panel': {'icon': 'star', 'iconClass': 'oi-filled'}}
```

You might be interested in leaving just the icon. In that case, set an empty string on
the `name` property:

```python
{'shown_in_panel': {'icon': 'thumb_up', 'name': ''}}
```

You could also want to add a hotkey. In such case add the `hotkey` property:

```python
{'shown_in_panel': {'icon': 'thumb_up', 'hotkey': 'F'}}
```

You can show filters (date filters included), groups (by date as well) or even
favorites. Date filters and date groups are applied with their default period or
interval.
