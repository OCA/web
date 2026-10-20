Add `searchable="1"` to the embedded `<list>` of the x2many field:

```xml
<field name="line_ids">
    <list editable="bottom" searchable="1">
        <field name="product_id"/>
        <field name="name"/>
    </list>
</field>
```

How it works:

- Type a query in the input, then press **Enter** to apply the filter.
- The applied filter is shown as a **facet (chip)**; the input is cleared after applying.
- Click the **Advanced** button to edit an additional domain; it is also shown as a facet.
- Use the facet remove icon or the **Clear** button to reset filters.

