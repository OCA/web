# Using view conditions

- In the list view declaration, put `options='{"bg_color": "red: customer==True"}`
  attribute in the `field` tag:

  ```xml
  ...
  <field name="arch" type="xml">
      <list string="View name">
          ...
          <field name="name" options='{"bg_color": "red: customer == True"}'/>
          ...
      </list>
  </field>
  ...
  ```

  With this example, column which renders 'name' field will have its **background**
  colored in red on customer records.

- In the list view declaration, put `options='{"fg_color": "white:customer == True"}'`
  attribute in the `field` tag:

  ```xml
  ...
  <field name="arch" type="xml">
      <list string="View name">
          ...
          <field name="name" options='{"fg_color": "white:customer == True"}'/>
          ...
      </list>
  </field>
  ...
  ```

  With this example, column which renders 'name' field will have its **text** colored in
  white on customer records.

- If you want to use more than one color, you can split the attributes using ';':

  ```
  options='{"fg_color": "red:red_color == True; green:green_color == True"}'
  ```

  ```xml
  ...
  <field name="arch" type="xml">
      <list string="View name">
          ...
          <field name="name" options='{"fg_color": "red:red_color == True; green:green_color == True"}'/>
          ...
      </list>
  </field>
  ...
  ```

- Can use strings too... In the list view declaration, put
  `options="{'fg_color': 'green:customer_state == \'success\''}"` attribute in the
  `field` tag:

  ```xml
  ...
  <field name="arch" type="xml">
      <list string="View name">
          ...
          <field name="name" options="{'fg_color': 'green:customer_state == \'success\''}"/>
          ...
      </list>
  </field>
  ...
  ```

**Note that you can use single or normal quotes. If the declaration of the options
doesn't follow the JSON format, the options string will be evaluated using py.eval()**

# Using view fields

- In the list view declaration, put `options='{"bg_color": "my_color"}` attribute in the
  `field` tag:

  ```xml
  ...
  <field name="arch" type="xml">
      <list string="View name">
          ...
          <field name="my_color" column_invisible="1"/>
          <field name="name" options='{"bg_color": "my_color"}'/>
          ...
      </list>
  </field>
  ...
  ```

  With this example, the content of the field named `my_color` will be used to populate
  the `background-color` CSS value. Use a compute field to return whichever color you
  want depending on the other record values.
