When exporting a list view to an Excel file, the export mirrors the
current group expansion state. The number of group levels visible in
the UI determines how many levels are included in the export:

- All groups collapsed → only top-level group summary rows.
- N levels of groups expanded → N levels of group summary rows, each
  with its aggregated values but no further detail.
- All levels expanded → full export including individual records.

This works with any number of Group By filters applied simultaneously.
