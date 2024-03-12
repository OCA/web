Make Odoo an installable Progressive Web Application.

Progressive Web Apps provide an installable, app-like experience on desktop and mobile that are built and delivered directly via the web.
They're web apps that are fast and reliable. And most importantly, they're web apps that work in any browser.
If you're building a web app today, you're already on the path towards building a Progressive Web App.


+ Developers Info.

The service worker is constructed using 'Odoo Class' to have the same class inheritance behaviour that in the 'user pages'. Be noticed
that 'Odoo Bootstrap' is supported so, you can use 'require' here.

All service worker content can be found in 'static/src/js/worker'. The management between 'user pages' and service worker is done in
'pwa_manager.js'.

The purpose of this module is give a base to make PWA applications.

+ CSS Classes to use in qweb templates

  - oe_pwa_standalone_invisible : Can be used in the "form" element to get a "empty" form (all is unavailable/invisible).
  - oe_pwa_standalone_no_chatter : Can be used in the "form" element to avoid render chatter zone.
  - oe_pwa_standalone_no_sheet : Can be used in the "form" element to don't use the sheet style.
  - oe_pwa_standalone_visible : Can be used in a element when the form has the 'oe_pwa_standalone_invisible' class to make the element available.
  - oe_pwa_standalone_omit : Can be used in elements to make them unavailable in standalone mode.
  - oe_pwa_standalone_only : Can be used in elements to make them available only in standalone mode.

What does 'unavailable/invisible' mean?
This 'invisible' state is not only the same as use "invisible=1" in qweb. Here invisible means that the client will not process the fields completely (no rpc calls will be made).

** All ancestors of an element that is visible will also be visible.
** All invisible fields (invisible=1 in qweb definition) will be available by default.
** 'oe_pwa_standalone_omit' and 'oe_pwa_standalone_only' will be filtered on the server side too.

+ XML Attributes to use in qweb templates

  - standalone-attrs : Used to extend the node attrs in standalone mode.

+ Tips for developers to update templates with an standalone mode

  - Odoo gets the first element when no index is used in qweb xpath, so... duplicated fields must be added after "the original" to ensure that other modules changes the correct element.
  - If you define duplicated fields use the 'oe_pwa_standalone_omit' class in the original and 'oe_pwa_standalone_only' class in the duplicated one to avoid problems.
  - Set a a very low priority (high value) in your 'standalone view' template.
