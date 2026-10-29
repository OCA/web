The coloring is active by default on every many2one field pointing to a model
that provides the color state. To disable it on a specific field, add the
`no_color` widget option in the view:

```xml
<field name="partner_id" options="{'no_color': True}" />
```

The option applies to the field node it is set on. When the same field is
shown several times in a view, the color data is read once for all of its
nodes and only the nodes without the option are colored.
