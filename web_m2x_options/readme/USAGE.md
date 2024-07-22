## in the field's options dict

`create` *boolean* (Default: depends if user have create rights)

> Whether to display the "Create..." entry in dropdown panel. Only for m2o fields.

`create_edit` *boolean* (Default: depends if user have create rights)

> Whether to display "Create and Edit..." entry in dropdown panel

`limit` *int* (Default: odoo default value is `8`)

> Number of displayed record in drop-down panel

`search_more` *boolean*

> Used to force disable/enable search more button.

`field_color` *string*

> A string to define the field used to define color. This option has to
> be used with colors.

`colors` *dictionary*

> A dictionary to link field value with a HTML color. This option has to
> be used with field_color.

`open` *boolean* (Default: `False`)

> Makes many2one buttons that open the linked resource.

## ir.config_parameter options

Now you can disable "Create..." and "Create and Edit..." entry for all
widgets in the odoo instance. If you disable one option, you can enable
it for particular field by setting "create: True" option directly on the
field definition.

`web_m2x_options.create` *boolean* (Default: depends if user have create
rights)

> Whether to display the "Create..." entry in dropdown panel for all
> fields in the odoo instance.

`web_m2x_options.create_edit` *boolean* (Default: depends if user have
create rights)

> Whether to display "Create and Edit..." entry in dropdown panel for
> all fields in the odoo instance.

`web_m2x_options.limit` *int* (Default: odoo default value is `8`)

> Number of displayed record in drop-down panel for all fields in the
> odoo instance

`web_m2x_options.search_more` *boolean* (Default: default value is
`False`)

> Whether the field should always show "Search more..." entry or not.

`web_m2x_options.field_limit_entries` *int*

> Number of displayed lines on all One2many fields

To add these parameters go to Configuration -\> Technical -\> Parameters
-\> System Parameters and add new parameters like:

- web_m2x_options.create: False
- web_m2x_options.create_edit: False
- web_m2x_options.limit: 10
- web_m2x_options.search_more: True
- web_m2x_options.field_limit_entries: 5

## Example

Your XML form view definition could contain:

``` xml
...
<field name="partner_id" options="{'limit': 10, 'create': false, 'create_edit': false, 'search_more': true, 'field_color':'type', 'colors':{'contact':'green', 'invoice': 'red', 'delivery': 'blue'}}"/>
...
```
