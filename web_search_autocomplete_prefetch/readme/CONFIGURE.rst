* some searches (especially via function fields) can be very heavy on the
  server.
  To disable prefetching on a per field basis, set the option
  `web_search_autocomplete_prefetch.disable`::

    options="{'web_search_autocomplete_prefetch.disable': true}"

  on your field in the search view.
* by default, the addon triggers a search 350 milliseconds after the last key
  press. If you want a different timeout, set the parameter
  ``web_search_autocomplete_prefetch.keypress_timeout`` to the amount of
  milliseconds you need as timeout.
