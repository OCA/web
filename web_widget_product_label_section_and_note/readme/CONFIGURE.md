To extend this functionality to other modules (for example, Purchase),
in a new module, it is necessary to create an inherited view to change
the widget for these fields:

- one2many field with widget="product_label_section_and_note_field_o2m".
- product_id or producttmpl_id field with
  widget="product_label_section_and_note_field".
- name field with widget="section_and_note_text".

If in your Odoo instance you have installed the module `sale_product_configurator`, you need to install the module 
[sale_product_configurator_widget_product_label](https://github.com/OCA/sale-workflow/tree/17.0/sale_product_configurator_widget_product_label) for it to work properly.