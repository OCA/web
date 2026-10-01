Go to **Settings → Technical → Menu** section.

* **Lang name**: language used to read menu labels when sorting.
  Defaults to the company language (``res.company.partner_id.lang``).
  Override only if you need to sort using a different language.
* **Algorithm**: choose one of three ordering strategies:

  * *By sequence* (default): normalises existing ``sequence`` values
    (10, 20, 30 …) without changing the visual order. Safe choice when
    menus are already ordered manually.
  * *Alphabetical order*: sorts all top-level menus alphabetically
    using the configured language.
  * *By custom label*: lets you specify an ordered list of menu labels
    (one per line). Menus matching the list are placed first in the
    given order; remaining menus are sorted alphabetically and appended
    at the end.

* **Menu Order Labels** (visible only for *By custom label*): enter one
  menu label per line in the target language.

Click **Reorder Menus** to apply the ordering immediately.
