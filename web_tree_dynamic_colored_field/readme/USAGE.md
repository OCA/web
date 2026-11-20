- In the tree view declaration, put
  `options='{"bg_color": "red: customer==True"}` attribute in the
  `field` tag:

      ...
      <field name="arch" type="xml">
          <tree string="View name">
              ...
              <field name="name" options='{"bg_color": "red: customer == True"}'/>
              ...
          </tree>
      </field>
      ...

      With this example, column which renders 'name' field will have its **background** colored in red on customer records.

- In the tree view declaration, put
  `options='{"fg_color": "white:customer == True"}'` attribute in the
  `field` tag:

      ...
      <field name="arch" type="xml">
          <tree string="View name">
              ...
              <field name="name" options='{"fg_color": "white:customer == True"}'/>
              ...
          </tree>
      </field>
      ...

      With this example, column which renders 'name' field will have its **text** colored in white on customer records.

- If you want to use more than one color, you can split the attributes
  using ';':

```
options='{"fg_color": "red:red_color == True; green:green_color == True"}'
```

Example:

``` xml
...
 <field name="arch" type="xml">
     <tree string="View name">
         ...
         <field name="name" options='{"fg_color": "red:red_color == True; green:green_color == True"}'/>
         ...
     </tree>
 </field>
 ...
```

- Can use strings too... In the tree view declaration, put
  `options="{'fg_color': 'green:customer_state == \'success\''}"`
  attribute in the `field` tag:

      ...
      <field name="arch" type="xml">
          <tree string="View name">
              ...
              <field name="name" options="{'fg_color': 'green:customer_state == \'success\''}"/>
              ...
          </tree>
      </field>
      ...

**Note that you can use single or normal quotes. If the declaration of
the options doesn't follow the JSON format, the options string will be
evaluated using py.eval()**
