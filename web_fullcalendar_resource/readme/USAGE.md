To use the resource view, declare an `ir.ui.view` of type `resource`
whose arch root is a `<resource>` tag. It accepts the same attributes as
the standard `<calendar>` view, plus the mandatory `resource_field`
attribute, which points to the field used to split events into columns.

``` xml
<resource date_start="date_start" date_stop="date_stop"
          resource_field="resource_id" mode="day">
    <field name="name"/>
    <field name="resource_id" filters="1"/>
</resource>
```

The `resource_field` may be a `many2one`, `many2many` or `one2many`
field; an event spanning several resources is then shown in every
matching column.

Add the `resource` view mode to the related window action so the view
becomes selectable:

``` xml
<field name="view_mode">resource,calendar,list,form</field>
```

By default, only the resources actually referenced by the loaded records
are displayed as columns. A business module can show every resource of a
domain by extending `ResourceCalendarModel` and overriding
`showAllResources` and `resourceDomain()`.
