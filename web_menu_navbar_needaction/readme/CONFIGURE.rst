To configure the update frequency, set the configuration parameter `web_menu_navbar_needaction.refresh_timeout` to the amount of milliseconds after which the counters should be updated. Don't do this too often, as this will cause a lot of queries to the database. The default it 600000, which is equivalent to 10 minutes.

To disable updates, set the parameter to 0.
