After module installation the ID of the last opened specific menu will be cached in the URL under parameter
``secondary_menu_id`` (originally Odoo only cache the primary menu ID which is the root menu ID (app menu).

When switch to another APP, the ``secondary_menu_id`` param will be removed from the URL.

Note that this is only a caching implementation of the current secondary menu and there is no routing/redirect
involved, meaning that if you try to submit the current URL with a different ``secondary_menu_id`` value
you will not be redirected to that menu.
