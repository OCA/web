Note: Data added to the footer ``support_branding`` is not shown while using
this module.

* Provide full menu search feature instead of just App search
* Drag drawer from left to open in mobile
* Figure out how to test focus on hidden elements for keyboard nav tests
* If you resize the window, body gets a wrong ``overflow: auto`` css property
  and you need to refresh your view or open/close the app drawer to fix that.
* Override LESS styling to allow for responsive widget layouts
* Adding ``oe_main_menu_navbar`` ID to the top navigation bar triggers some
  great styles, but also `JavaScript that causes issues on mobile
  <https://github.com/OCA/web/pull/446#issuecomment-254827880>`_
