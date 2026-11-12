This module adds a backend Char field widget that typeahead-fills the field
from a public `@api.model` method on the same model.

Type in the field; after a configurable number of characters the widget calls
the method with the trimmed input, shows matching rows, and on select writes
the Char plus supported extra scalar and relational fields that exist on the
model and in the current view. `min_symbols` `0` opens that list on focus and
calls the method with `False`, so the field can be used before any typing.
See Usage for supported value formats.
