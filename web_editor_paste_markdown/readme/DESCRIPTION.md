This module brings Markdown to the HTML fields, without storing Markdown: the field
keeps its HTML.

- **Paste Markdown** (command menu, type `/`): a dialog where you paste Markdown text,
  see the HTML preview, and insert the converted HTML into the field.
- **To Markdown** (command menu for the whole field, toolbar button for the selected
  text): the same dialog, filled with the content converted to Markdown. Copy it to use
  it outside Odoo, or edit it and replace the content.

Tables, code blocks, inline code and quotes get inline styles, so that they render the
same way in the editor and in e-mails. Markdown task lists become Odoo checklists, and
back.

The conversions run in the browser with the markdown-it and Turndown libraries, shipped
with the module: it does not need a Markdown editor widget.
