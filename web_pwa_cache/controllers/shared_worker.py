# Copyright 2021 Tecnativa - Alexandre D. Díaz
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
from odoo.addons.web_pwa_oca.controllers.service_worker import ServiceWorker
from odoo.http import request


class SharedWorker(ServiceWorker):

    JS_PWA_SHARED_EVENT_MESSAGE = """
        onconnect = function(evt_conn) {{
            const port = evt_conn.ports[0];

            port.onmessage = function(evt_msg) {{
                {}
                var workerResult = 'Result: ' + (e.data[0] * e.data[1]);
                port.postMessage(workerResult);
            }}
        }}
    """

    JS_PWA_SHARED_MAIN = """
        self.importScripts(...{pwa_shared_scripts});

        odoo.define("web_pwa_oca.SharedWorker", function (require) {{
            "use strict";

            {pwa_shared_requires}

            {pwa_shared_init}
            {pwa_shared_event_message}
        }});
    """

    def _get_js_pwa_shared_init(self):
        return """
            if (typeof self.oca_pwa_shared === "undefined") {{
                self.oca_pwa_shared = new PWAShared({});
            }}
        """.format(
            self._get_pwa_params()
        )

    def _get_js_pwa_requires(self):
        return """
            require('web_pwa_cache.PWAShared');
        """

    @staticmethod
    def _get_static_cache_worker(filepath):
        return "/web_pwa_cache/static/src{}".format(filepath)

    def _get_pwa_params(self):
        res = super()._get_pwa_params()

        urls = []
        urls.extend(self._get_asset_urls("web.assets_common"))
        urls.extend(self._get_asset_urls("web.assets_backend"))
        urls.extend(self._get_asset_urls("web_editor.summernote"))
        urls.extend(self._get_asset_urls("web_editor.assets_wysiwyg"))
        cache_hashes = self._get_pwa_cache_hashes()
        request.env["ir.config_parameter"].sudo().set_param(
            "pwa.cache.version", cache_hashes["pwa"]
        )
        urls.extend(self._get_base_urls(cache_hashes))
        res["cache_hashes"] = cache_hashes
        res["prefetched_urls"] = list(set(urls))

        # Add 'GET' resources
        pwa_cache_obj = request.env["pwa.cache"]
        records = pwa_cache_obj.search(self._get_pwa_cache_domain(["get"]))
        res["prefetched_urls"] += pwa_cache_obj._get_text_field_lines(
            records, "get_urls"
        )
        return res

    def _get_pwa_scripts(self):
        res = super()._get_pwa_scripts()
        res.insert(0, self._get_static_cache_worker("/lib/sqlite/dist/sw.js"))
        res.insert(0, self._get_static_cache_worker("/lib/crc32/crc32.js"))
        res.insert(0, "/web/static/lib/moment/moment.js")
        to_insert = [
            "/web/static/src/js/core/translation.js",
            "/web/static/src/js/core/utils.js",
            "/web/static/src/js/core/mixins.js",
            self._get_static_cache_worker("/js/mixins/broadcast_mixin.js"),
            self._get_static_cache_worker("/js/worker/core/base/tools.js"),
            self._get_static_cache_worker("/js/worker/core/base/sandbox.js"),
            self._get_static_cache_worker("/js/worker/core/base/rpc.js"),
            self._get_static_cache_worker("/js/worker/core/osv/expression.js"),
            self._get_static_cache_worker("/js/worker/core/osv/query.js"),
            self._get_static_cache_worker("/js/worker/core/osv/model.js"),
            self._get_static_cache_worker("/js/worker/core/db/database.js"),
            self._get_static_cache_worker("/js/worker/core/db/sqlitedb.js"),
            self._get_static_cache_worker("/js/worker/systems/cache.js"),
            self._get_static_cache_worker("/js/worker/systems/database.js"),
            self._get_static_cache_worker("/js/worker/managers/manager.js"),
            self._get_static_cache_worker("/js/worker/managers/config.js"),
            self._get_static_cache_worker("/js/worker/managers/sync.js"),
            self._get_static_cache_worker("/js/worker/components/component.js"),
            self._get_static_cache_worker("/js/worker/components/exporter.js"),
            self._get_static_cache_worker("/js/worker/components/importer.js"),
            self._get_static_cache_worker("/js/worker/components/prefetch.js"),
        ]
        insert_pos = res.index("/web/static/src/js/core/class.js") + 1
        for index, url in enumerate(to_insert):
            res.insert(insert_pos + index, url)
        to_insert = [
            self._get_static_cache_worker("/js/worker/pwa.js"),
            self._get_static_cache_worker("/js/worker/bus.js"),
            self._get_static_cache_worker("/js/worker/routes.js"),
        ]
        insert_pos = res.index("/web_pwa_oca/static/src/js/worker/pwa.js") + 1
        for index, url in enumerate(to_insert):
            res.insert(insert_pos + index, url)

        insert_pos = res.index("/web/static/lib/underscore/underscore.js") + 1
        res.insert(
            insert_pos, "/web/static/lib/underscore.string/lib/underscore.string.js"
        )
        return res
