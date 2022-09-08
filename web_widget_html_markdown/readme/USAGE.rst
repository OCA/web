Your XML form view definition should contain:

    ...
    <field name="field_name" widget="html_markdown"/>
    ...

This will replace the default Html widget with the new Markdown/HTML widget and
allow the field to be edited as Markdown or HTML, depending on the user's choice.

  #### Options
      - default_markdown_on_new : if true when creating a new record, markdown will
        be selected by default.
      - only_markdown_on_new : if true when creating a new record, only markdown
        will be present on radiobutton.

      example

      ´´´
      <field name="description"
      widget="html_markdown"
      options="{'only_markdown_on_new' : 1,
      'default_markdown_on_new':1}"/>
      ´´´

      will offer only markdown on new records , very useful for exqmple in mail threads,
      if we want to have markdown only threads.
