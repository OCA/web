By default, this module will replace the original `html` wysiwyg field with CKEditor.
The original `html` widget will be renamed as `html_odoo`.

If you only want to use `ckeditor` on specific views, you can disable the `html` widget
override by archiving the `web_widget_ckeditor.assets_backend_field_html_override` view.

When the global `html` widget replacement is disabled, `ckeditor` has to be explicitly
set on the desired `ir.ui.view`:

.. code-block:: xml

    <field name="description_html" widget="ckeditor" />


The CKEditor toolbar can be customized with an `ir.config_parameter`. To do so,
please create a parameter named `web_widget_ckeditor.toolbar`, and set the desired
toolbar items using either `,`, `space` or `newline` as separators.

.. code-block::

    heading
    | bold italic underline removeFormat
    | fontSize fontColor fontBackgroundColor
    | bulletedList numberedList alignment
    | outdent indent pagebreak
    | link imageUpload blockQuote insertTable
    | undo redo


There's more information about available toolbar items in the
`official CKEditor documentation page
<https://ckeditor.com/docs/ckeditor5/latest/features/toolbar/toolbar.html>`_
