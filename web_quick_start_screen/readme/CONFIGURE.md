To create quick actions:

- Go to *Settings > Technical > User Interface > Screen actions* and create o modify an
  existing one.
- Choose the desired action, a name, a description and an icon.
- You can add an optional context so you can reuse existing actions. You can use
  `ref(<xml_id>)` to get an id that you can use in your context. You can also use
  `datetime` and `context_today` in that same way you can do in `ir.filters`.

To create quick start screens:

- Go to *Settings > Technical > User Interface > Quick start screens* and create or
  modify an existing one.
- Choose a descriptive name and link some quick screen actions.

To assign a quick start screen to a user:

- Go to *Settings > Users and groups > Users* and select one.
- In the *Preferences* tab, *Menus customization* section, you can choose which
  *Quick start screen* will that user use.
- If you want to make the user start always in his start screen, in the same section
  select the action *Quick Start Screen*.

To activate the quick start screen menu for a user:

- Go to *Settings > Users and groups > Users* (with debug mode on)
- In *Technical* groups, set *Quick Start Screen* on.
