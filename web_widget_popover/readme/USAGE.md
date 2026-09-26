Use the `popover` widget on `Char` or `Text` fields.

```xml
<field
    name="warning_message"
    widget="popover"
    icon="fa-warning"
    class="text-danger"
    nolabel="1"
/>
```

In list views, use `nolabel="1"` to hide the column header: the column is then
kept as narrow as the icon.
