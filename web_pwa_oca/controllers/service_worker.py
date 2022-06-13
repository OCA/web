# Copyright 2021 Tecnativa - Alexandre D. Díaz
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
from odoo.http import request, route

from .main import PWA


class ServiceWorker(PWA):
    _pwa_sw_version = "0.1.0"

    JS_PWA_CORE_EVENT_INSTALL = """
        self.addEventListener('install', evt => {{
            console.log('[ServiceWorker] Installing...');
            {}
        }});
    """

    JS_PWA_CORE_EVENT_FETCH = """
        self.addEventListener('fetch', evt => {{
            {}
        }});
    """

    JS_PWA_CORE_EVENT_ACTIVATE = """
        self.addEventListener('activate', evt => {{
            {}
        }});
    """

    JS_PWA_MAIN = """
        self.importScripts(...{pwa_scripts});

        odoo.define("web_pwa_oca.ServiceWorker", function (require) {{
            "use strict";

            {pwa_requires}

            {pwa_init}
            {pwa_core_event_install}
            {pwa_core_event_activate}
            {pwa_core_event_fetch}
        }});
    """

    def _get_js_pwa_requires(self):
        return """
            const PWA = require('web_pwa_oca.PWA');
        """

    def _get_js_pwa_init(self):
        return """
            let promise_start = Promise.resolve();
            if (typeof self.oca_pwa === "undefined") {{
                self.oca_pwa = new PWA({});
                promise_start = self.oca_pwa.start();
                if (self.serviceWorker.state === "activated") {{
                    promise_start = promise_start.then(
                        () => self.oca_pwa.activateWorker(true));
                }}
            }}
        """.format(
            self._get_pwa_params()
        )

    def _get_js_pwa_core_event_install_impl(self):
        return """
            evt.waitUntil(promise_start.then(() => self.oca_pwa.installWorker()));
        """

    def _get_js_pwa_core_event_activate_impl(self):
        return """
            console.log('[ServiceWorker] Activating...');
            evt.waitUntil(promise_start.then(() => self.oca_pwa.activateWorker()));
        """

    def _get_js_pwa_core_event_fetch_impl(self):
        return """
        if (evt.request.url.startsWith(self.registration.scope)) {
            evt.respondWith(promise_start.then(
                () => self.oca_pwa.processRequest(evt.request)));
        }
        """

    def _get_pwa_scripts(self):
        """Scripts to be imported in the service worker (Order is important)"""
        return [
            "/web/static/lib/underscore/underscore.js",
            "/web_pwa_oca/static/src/js/worker/jquery-sw-compat.js",
            "/web/static/src/js/promise_extension.js",
            "/web/static/src/js/boot.js",
            "/web/static/src/js/core/class.js",
            "/web_pwa_oca/static/src/js/worker/pwa.js",
        ]

    def _get_pwa_params(self):
        """Get javascript PWA class initialzation params"""
        return {
            "sw_version": self._pwa_sw_version,
        }

    @route("/service-worker.js", type="http", auth="public")
    def render_service_worker(self):
        """Route to register the service worker in the 'main' scope ('/')"""

        sw_code = self.JS_PWA_MAIN.format(
            **{
                "pwa_scripts": self._get_pwa_scripts(),
                "pwa_requires": self._get_js_pwa_requires(),
                "pwa_init": self._get_js_pwa_init(),
                "pwa_core_event_install": self.JS_PWA_CORE_EVENT_INSTALL.format(
                    self._get_js_pwa_core_event_install_impl()
                ),
                "pwa_core_event_activate": self.JS_PWA_CORE_EVENT_ACTIVATE.format(
                    self._get_js_pwa_core_event_activate_impl()
                ),
                "pwa_core_event_fetch": self.JS_PWA_CORE_EVENT_FETCH.format(
                    self._get_js_pwa_core_event_fetch_impl()
                ),
            }
        )
        return request.make_response(
            sw_code,
            [
                ("Content-Type", "text/javascript;charset=utf-8"),
                ("Content-Length", len(sw_code)),
            ],
        )
