## Field Widget

To use the JSON editor widget in your form views, add the
`widget="json_editor"` attribute to your field:

``` xml
<field name="json_data" widget="json_editor"/>
```

The widget supports `text`, `char`, and `json` field types.

## With Schema Validation

You can provide a JSON Schema for validation and autocomplete:

``` xml
<field name="json_data" widget="json_editor"
       options="{'schema': {'type': 'object', 'properties': {'name': {'type': 'string'}}}}"/>
```

## OWL Component

You can also use the JSON editor as a standalone OWL component in your
custom code:

``` javascript
import { JsonEditorComponent } from "@web_widget_json_editor/components/json_editor/json_editor";

// In your component
static components = { JsonEditorComponent };
```

The component accepts the following props:

- `value`: Initial JSON value (object or string)
- `onChange`: Callback when value changes
- `schema`: JSON Schema for validation
- `mode`: Editor mode ('code' or 'view')
- `height`: Editor height (default: '400px')
