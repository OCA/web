Pedro M. Baeza (pedro.baeza@tecnativa.com):
When you have groups, they are not exported to Excel. It would be desirable to have this option.
One of the problems with this module is that you can't export data from a view with mode="tree".
Changing the approach to have the button always visible (we should relocate it also to another place,
as the current location is not visible for these views), and digging correctly in the DOM elements
for this view (very similar to the normal tree view one) will do the trick. This will also help users
to locate the feature, as it's hidden now by default and users don't think about selecting records.
The behavior will be: nothing selected > you export all (including groups).
Something or all selected: export the selection.
