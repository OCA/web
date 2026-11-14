```xml
<field name="detail_ref" invisible="1"/>
<widget name="sub_view_form" ref-field="detail_ref"/>
```

The reference field must be in the view to be loaded.

Only the form view is supported: the pointed record is shown in its default
form view, with its own save / discard buttons.

Optional attribute:

- `context`: evaluated with the current record values
