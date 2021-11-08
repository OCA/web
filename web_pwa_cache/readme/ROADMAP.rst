* 'create_multi' is splitted in normal 'create' in offline mode
* Can't use domains with dotted leafs
* one2many fields inside of one2many field don't work
* Only supports mono-database instances
* Sqlite doesn't have '=like' operator (all are case insensitive by default)
* Use 'dev=xml' don't update the "write_date" field because usage of computed method... so, can't update caches when enabled.
* Improve "grouping" feature... For example in kanban and web_read_group, read_progress_bar
*
