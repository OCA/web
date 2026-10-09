This module adds a backend Char field widget that typeahead-fills the field
from a public `@api.model` method on the same model.

Type in the field; after a configurable number of characters the widget calls
the method with the trimmed input, shows matching rows, and on select writes
the Char plus supported extra scalar and relational fields that exist on the
model and in the current view. See Usage for supported value formats.
