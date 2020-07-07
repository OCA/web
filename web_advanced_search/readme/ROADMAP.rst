Improvements to the ``domain`` widget, not exclusively related to this addon:

* Use relational widgets when filtering a relational field
* Allow to filter field names

Improvements to the search view in this addon:

* Use widgets ``one2many_tags`` when searching ``one2many`` fields
* Use widgets ``many2many_tags`` when searching ``many2many`` fields
* Allow to edit current full search using the advanced domain editor

Improvements to the `is child of`/`is parent of` operators:

* Show the operators only for models with `_parent_store = True`
