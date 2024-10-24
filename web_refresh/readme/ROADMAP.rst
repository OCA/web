Current module limitations:

* Refresh on changes doesn't works correctly with more than one tab in browser. Because longpolling is performed
  only by one master tab (not necessarily active) and only this tab will reload on changes.
* Many2one, One2many, Many2many fields currently supported only for 1-st level changes.
  I.e. display_name change for linked Many2one item will not trigger reloading in "`Reload on server changes`" mode.
  But changing it to another record triggers correctly.
* Some computed fields in standard modules doesn't have correct `@api.depends` configured.
  Because of this, this module does not always detect changes (most often for `stat buttons`).
  Actual rule: if `write_date` for record changed then change is detected.
* There is no support for watching chatter / discuss changes.

Planned improvements:

* Add graph, calendar and activities views heuristics
  to more accurate changes detection for them. Fewer false positives.
* Add watching changes support for chatter / discuss.
* Add watching changes support to Mx2x fields in their `display_name`. I.e. on tag renaming.
* Add whitelist / blacklist configuration for models that changes will be watched.
