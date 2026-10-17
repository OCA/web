This module aims to add support for dynamically coloring fields in list view according
to data in the record.

## Features

- Add attribute `bg_color` on field's `options` to color background of a cell in list
  view
- Add attribute `fg_color` on field's `options` to change text color of a cell in list
  view
- Add attribute `bg_color_field` on list's `colors` to change background color of the
  entire row in list view (\*)
- Add attribute `fg_color_field` on list's `colors` to change text color of the entire
  row in list view (\*)

(\*) This functionality only works for a list defined in a form. (Since 13.0, the
`colors` attribute is no longer in the RelaxNG schema of the list view, so we can't use
it like before, but it looks like the RNG is not checked for embedded list.)

## Testing

Some views are overriden for demoing this module functionnalities:

1. On the Users list view: The `name` and `login_date` fields are colored according to
   conditions written in view definition.
2. On the Groups form view > "Access Rights": By renaming the rule name to a color (red,
   blue, yellow, #00FDF0), the entire row background color is immediatly updated.
3. On the System Parameters list view:
   - For the `key` field: Its content is the text color, the `value` field is its
     background color.
   - For the `value` field: Its content is the text color, the `value` field is its
     background color.
