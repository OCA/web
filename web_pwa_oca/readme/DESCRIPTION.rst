Make Odoo an installable Progressive Web Application.

Progressive Web Apps provide an installable, app-like experience on desktop and mobile that are built and delivered directly via the web.
They're web apps that are fast and reliable. And most importantly, they're web apps that work in any browser.
If you're building a web app today, you're already on the path towards building a Progressive Web App.


+ Developers Info.

The service worker is contructed using 'Odoo Class' to have the same class inheritance behaviour that in the 'user pages'. Be noticed
that 'Odoo Bootstrap' is not supported so, you can't use 'require' here.

All service worker content can be found in 'static/src/js/worker'. The management between 'user pages' and service worker is done in
'pwa_manager.js'.

The purpose of this module is give a base to make PWA applications.
