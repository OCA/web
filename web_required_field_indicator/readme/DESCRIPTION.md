When a required field is left empty, Odoo shows a notification titled
"Invalid fields:", which is misleading: the field is not invalid, it is
simply not filled in. This module also makes it easier to locate such
fields when they are hidden inside a notebook page.

## Features

- Renames the notification title from "Invalid fields:" to "Required
  fields not filled:".
- Highlights, in red, the notebook tab of any page that contains a
  required field that is not filled in, the same way the field itself
  is highlighted.
