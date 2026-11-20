Add the `markdown` widget to a text field in a form view:

```xml
<field name="description" widget="markdown" />
```

Options, passed through the `options` attribute:

```xml
<field
  name="description"
  widget="markdown"
  options="{'height': '500px', 'initial_edit_type': 'wysiwyg'}"
/>
```

| Option              | Default     | Description                               |
| ------------------- | ----------- | ----------------------------------------- |
| `height`            | `"auto"`    | editor height                             |
| `min_height`        | `"200px"`   | minimum editor height                     |
| `initial_edit_type` | `"markdown"` | initial mode: `"markdown"` or `"wysiwyg"` |
| `hide_mode_switch`  | `false`     | hide the Markdown / WYSIWYG switch        |
| `placeholder`       | `""`        | placeholder of the empty editor           |
| `language`          | -           | Toast UI language code (e.g. `"fr-FR"`)   |

The field stores the raw Markdown text. The widget is not available on html fields:
Odoo sanitizes them on save, which would alter the Markdown. To insert Markdown in an
html field, see the module `web_editor_paste_markdown`.

The editor opens in Markdown mode; the tabs below the editor switch between Markdown
and WYSIWYG. In WYSIWYG mode, use the toolbar for headings and lists: Markdown signs
typed there are kept as plain text.

With demo data, open Settings > Users & Companies > Groups > Markdown widget demo, tab
Notes.
