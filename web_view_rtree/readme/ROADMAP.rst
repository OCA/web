Does not work currently:

* Editing records
* Pagination and limiting the number of results
* Sorting of secondary model rows by column
* Navigating between records accessed from the view
* Validation of the view definition

Filtering is only partially supported. A search domain can be used in the
view, but it must be simple (a flat list of conditions without boolean
operators).

Displaying fields of secondary models is limited. It only works with simple
(non-relational) fields of the same type as those of the primary model.
