# Copyright 2021 Tecnativa - Alexandre D. Díaz
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
from odoo.addons.web_pwa_oca.controllers.service_worker import ServiceWorker


class ServiceWorker(ServiceWorker):
    def _get_js_pwa_init(self):
        res = """
            self.addEventListener('message', messageEvent => {
                if (messageEvent.data === 'skipWaiting') {
                    return self.skipWaiting();
                }
            });
        """
        res += super()._get_js_pwa_init()
        return res

    def _get_js_pwa_requires(self):
        res = """
            require('web_pwa_cache.PWA');
        """
        res += super()._get_js_pwa_requires()
        return res

    def _get_js_pwa_core_event_fetch_impl(self):
        res = super()._get_js_pwa_core_event_fetch_impl()
        res += """
            evt.respondWith(self.oca_pwa.processRequest(evt.request));
        """
        return res
