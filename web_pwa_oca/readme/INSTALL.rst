After having installed this module, browsing your odoo on mobile you will be able to install it as a PWA.

It is strongly recommended to use this module with a responsive layout, like the one provided by web_responsive.

This module is intended to be used by Odoo back-end users (employees).

When a Progressive Web App is installed, it looks and behaves like all of the other installed apps.
It launches from the same place that other apps launch. It runs in an app without an address bar or other browser UI.
And like all other installed apps, it's a top level app in the task switcher.

In Chrome, a Progressive Web App can either be installed through the three-dot context menu.

In case you previously installed `web_pwa`, run the following steps with `odoo shell`, after having installed `openupgradelib`:


>>> from openupgradelib import openupgrade
>>> openupgrade.update_module_names(env.cr, [('web_pwa', 'web_pwa_oca')], merge_modules=False)
>>> env.cr.commit()
