* 'create_multi' is splitted in normal 'create' in offline mode
* one2many fields inside of one2many field don't work
* Only supports mono-database instances
* Sqlite doesn't have '=like' operator (all are case insensitive by default)
* Use 'dev=xml' don't update the "write_date" field of the views because usage of computed method... so, can't update views caches when enabled.
* Improve "grouping" feature... For example in kanban and web_read_group, read_progress_bar
* Firefox can't detect 'standalone' mode. See https://github.com/mozilla-mobile/android-components/issues/8584
  Due to this, the service worker can't work properly. So, firefox is not compatible with this module.
* Some browsers have very restricted storage limits criteria, this can cause problems with indexeddb.
* Can't use standalone and normal mode at the same time because the ServiceWorker is shared by all the pages in the same domain.
* If install the PWA in localhost, be carefully when change the instance because you will use the last service worker installed.
* On the mobile, to ensure a correct prefetching process, before starting the PWA it is necessary to close the main browser. We have an issue open to try handle this in a correct way: https://bugs.chromium.org/p/chromium/issues/detail?id=1262969
* The WakeLock API is not supported in Safari, Firefox and Internet Explorer: https://caniuse.com/?search=wakelock
