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
{'shown_in_panel': {'icon': 'fa-thumbs-up', 'name': 'Ok'}}
```

You might be interested in leaving just the icon. In that case, set an empty string on
the `name` property:

```python
{'shown_in_panel': {'icon': 'fa-thumbs-up', 'name': ''}}
```

You could also want to add a hotkey. In such case add the `hotkey` property:

```python
{'shown_in_panel': {'icon': 'fa-thumbs-up', 'hotkey': 'F'}}
```

You can show filter, groups or even favorites.

Exclusive header buttons
========================

Header-button filters can be made mutually exclusive by adding
``exclusive_in_panel`` to the filter context.

When an exclusive header button is activated, the other active exclusive
header buttons are automatically deactivated. this is achieved by doing:

```xml

    <filter
        string="Draft"
        name="state_draft"
        domain="[('state', '=', 'draft')]"
        context="{'shown_in_panel': True, 'exclusive_in_panel': True}"
    />
```

same key concepts shown above can be applied e.g ``{'shown_in_panel': {'icon': 'fa-thumbs-up', 'name': 'Ok'}, 'exlusive_in_panel': True}