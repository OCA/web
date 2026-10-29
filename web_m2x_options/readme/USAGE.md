## in the field's options dict

`limit` *int* (Default: odoo default value is `8`)

> Number of displayed record in drop-down panel

`field_color` *string*

> A string to define the field used to define color. This option has to
> be used with colors.

`colors` *dictionary*

> A dictionary to link field value with a HTML color. This option has to
> be used with field_color.

`color_style` *string* (Default: `text`)

> How the color is shown in the drop-down panel. `text` colors the
> record's text. `bar` draws a thin accent bar on the left of the record
> and leaves the text untouched. With `bar`, a Bootstrap theme color name
> (`primary`, `secondary`, `success`, `info`, `warning`, `danger`,
> `light`, `dark`) follows the light or dark theme; any other value is
> used as a HTML color. This option has to be used with field_color and
> colors.

`field_icon` *string*

> A string to define the field used to pick an icon. This option has to
> be used with icons.

`icons` *dictionary*

> A dictionary to link field value with a Font Awesome icon class, shown
> on the left of the record in the drop-down panel. Values without an
> entry get no icon. This option has to be used with field_icon.

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

`web_m2x_options.field_limit_entries` *int*

> Number of displayed lines on all One2many fields

To add these parameters go to Configuration -\> Technical -\> Parameters
-\> System Parameters and add new parameters like:

- web_m2x_options.create: False
- web_m2x_options.create_edit: False
- web_m2x_options.limit: 10
- web_m2x_options.field_limit_entries: 5

## Example

Your XML form view definition could contain:

``` xml
...
<field name="partner_id" options="{'limit': 10, 'field_color':'type', 'colors':{'contact':'green', 'invoice': 'red', 'delivery': 'blue'}}"/>
...
```

``` xml
...
<field name="partner_id" options="{'field_color': 'type', 'color_style': 'bar', 'colors': {'contact': 'success', 'invoice': 'warning', 'delivery': 'info'}}"/>
...
```

``` xml
...
<field name="partner_id" options="{'field_icon': 'type', 'icons': {'contact': 'fa-user', 'invoice': 'fa-money', 'delivery': 'fa-truck'}}"/>
...
```
