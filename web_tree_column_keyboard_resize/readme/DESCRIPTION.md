This module creates some keyboard shortcuts to allow resizing tree view columns
when having some cell in the column focused (in edit mode for that cell / row).
This can improve efficiency, since users don't need to reach for the mouse when
wanting to resize columns.

The following shortcuts are added:
- By default, the width is adjusted in steps of 20 pixels per key press.
- `Shift + Down Arrow`: Decrease the width of the focused column.
- `Shift + Up Arrow`: Increase the width of the focused column.

The changed width of columns is reset back to the original once focusing out of
the current row, since this functionality is designed for temporary visibility
enhancement during editing sessions and not for permanent layout changes. Users
can use the standard mouse drag resizing for permanent width adjustments.
