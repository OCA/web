Does not work currently:

* Editing records
* Pagination and limiting the number of results
* Sorting of secondary model rows by column
* Navigating between records accessed from the view
* Validation of the view definition

Displaying fields of secondary models is limited. It only works with simple
(non-relational) fields of the same type as those of the primary model.

The default ordering of records is slightly different when using preloading:
with preloading, the default ordering of models is used, while without
preloading, the current ordering defined by the view is used.
