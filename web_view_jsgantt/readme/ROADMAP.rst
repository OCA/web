* The view is read-only, it is not possible to edit values.
* The order of the columns cannot be configured. The default order defined by
  jsgantt-improved is used.
* Several chart display options are not available.
* It is not possible to display additional (non-mapped) fields.
* The task dependency types cannot be set. Only the default "finish to start"
  is used.
* No validation of the internal task field names mapping is done. Using an
  unknown field name does not trigger an error.
* Grouping records (``groupBy``) is not supported.
* The color of the task bars is not configurable. One of the available colors
  is picked using a modulo on the id of the record.
