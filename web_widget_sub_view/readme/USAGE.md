This is a technical module.

You can add this kind of elements by using:

```xml
  <widget
    name="sub_view_widget"
    model="res.partner"
    domain="[('parent_id', '=', id)]"
    context="{'search_default_parent_id': id}"
  />
```

The `model` attribute is required. Context is recommended for setting default
values and forcing specific views or default searching values.

Available options:

- `view-type` forces a view type. By default, it uses list on desktop and
  kanban on mobile.
- `create-action` forces a specific action for creation (an XML ID).
- `open-action` selects the method used to open a record. By default, it uses
  `get_formview_action`.
- `filter="0"` hides the filters.
- `group-by="0"` hides the group-by menu.
- `favorite="0"` hides favorites.
- `lazy="1"` delays loading the subview until its container becomes visible.
  Without this option, the subview loads immediately.
- `link="0"` hides the button used to link existing records. It is shown by
  default for list and kanban views.
- `link-domain` sets the domain used by the record selector. It defaults to
  `[]`.
- `new="0"` hides the button used to create records in list and kanban views.
  It is shown by default when creation is allowed by the view.

The link button writes the `default_*` values from `context` to the selected
records. For example, `default_parent_id` links selected partners to the
current partner through their `parent_id` field. Save the current record before
linking existing records.

For example, to load a subview only when its notebook page becomes visible:

```xml
  <widget
    name="sub_view_widget"
    model="res.partner"
    domain="[('parent_id', '=', id)]"
    context="{'default_parent_id': id}"
    lazy="1"
    link-domain="[('parent_id', '=', False)]"
  />
```
