To use this module, you need to add widget="m2m_inline":

``` XML
<field name="my_m2m_field_ids" widget="m2m_inline">
     <tree editable="bottom">
       <field name="name"/>
     </tree>
</field>
```

There is an OOTB option to allow quick unlinking record:

``` XML
<field name="my_m2m_field_ids" widget="m2m_inline" options="{'quick_unlink': True}">
     <tree editable="bottom">
       <field name="name"/>
     </tree>
</field>
```
