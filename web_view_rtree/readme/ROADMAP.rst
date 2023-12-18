Does not work currently:

* Filtering (including defining where to start in the hierarchy): the search
  domain is ignored and the full hierarchy is always shown
* Pagination and limiting the number of results
* Remembering the state of open parents (to keep it in the current state when
  navigating back to the view)
* Sorting of columns
* Navigating between records accessed from the view
* Validation of the view definition

Known issues:

* All models are assumed to have a ``name`` field (used to display groups).
  Instead, the real ``_rec_name`` model property should be used.
