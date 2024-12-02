To extend this functionality to other modules (for example, Purchase),
in a new module, it is necessary to create an inherited view to change the widget for these fields:

- `one2many` field with `widget="product_label_section_and_note_field_o2m"`.

- `product_id` or product_tmpl_id field with `widget="product_label_section_and_note_field"`.

- `name` field with `widget="section_and_note_text"`.
