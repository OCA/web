When copying a table from a spreadsheet application into an Odoo rich-text field, the
Odoo editor strips the `colspan` and `rowspan` HTML attributes during the paste cleanup,
causing merged cells to be lost.

This module adds `colspan` and `rowspan` to the editor's attribute whitelist so that
merged cells are preserved when pasting tables from LibreOffice Calc, Microsoft Excel
or Google Sheets, for example.
