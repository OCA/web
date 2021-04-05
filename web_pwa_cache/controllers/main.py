# Copyright 2020 Tecnativa - Alexandre D. Díaz
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

import functools
import logging
import mimetypes

from odoo import http
from odoo.http import request, route
from odoo.modules import get_resource_path

from odoo.addons.web_pwa_oca.controllers.main import PWA

_logger = logging.getLogger(__name__)

mimetypes.add_type("application/wasm", ".wasm")


class PWA(PWA):
    def _get_asset_urls(self, asset_xml_id):
        """Get all urls that have 'asset_xml_id'"""
        qweb_sudo = request.env["ir.qweb"].sudo()
        assets = qweb_sudo._get_asset_nodes(asset_xml_id, {}, True, True)
        urls = []
        for asset in assets:
            if asset[0] == "link":
                urls.append(asset[1]["href"])
            if asset[0] == "script":
                urls.append(asset[1]["src"])
        return urls

    def _get_pwa_scripts(self):
        res = super()._get_pwa_scripts()
        res.insert(0, "/web_pwa_cache/static/src/lib/sqlite/dist/sw.js")
        res.insert(0, "/web_pwa_cache/static/src/lib/crc32/crc32.js")
        res.insert(0, "/web/static/lib/moment/moment.js")
        to_insert = [
            "/web/static/src/js/core/translation.js",
            "/web/static/src/js/core/utils.js",
            "/web/static/src/js/core/mixins.js",
            "/web_pwa_cache/static/src/js/worker/core/base/tools.js",
            "/web_pwa_cache/static/src/js/worker/core/base/sandbox.js",
            "/web_pwa_cache/static/src/js/worker/core/base/rpc.js",
            "/web_pwa_cache/static/src/js/worker/core/osv/expression.js",
            "/web_pwa_cache/static/src/js/worker/core/osv/query.js",
            "/web_pwa_cache/static/src/js/worker/core/osv/model.js",
            "/web_pwa_cache/static/src/js/worker/core/db/database.js",
            "/web_pwa_cache/static/src/js/worker/core/db/sqlitedb.js",
            "/web_pwa_cache/static/src/js/worker/core/db/indexeddb.js",
            "/web_pwa_cache/static/src/js/worker/core/cache_manager.js",
            "/web_pwa_cache/static/src/js/worker/core/database_manager.js",
            "/web_pwa_cache/static/src/js/worker/core/config.js",
            "/web_pwa_cache/static/src/js/worker/components/component.js",
            "/web_pwa_cache/static/src/js/worker/components/exporter.js",
            "/web_pwa_cache/static/src/js/worker/components/importer.js",
            "/web_pwa_cache/static/src/js/worker/components/sync.js",
            "/web_pwa_cache/static/src/js/worker/components/prefetch.js",
        ]
        insert_pos = res.index("/web/static/src/js/core/class.js") + 1
        for index, url in enumerate(to_insert):
            res.insert(insert_pos + index, url)
        to_insert = [
            "/web_pwa_cache/static/src/js/worker/pwa.js",
            "/web_pwa_cache/static/src/js/worker/bus.js",
            "/web_pwa_cache/static/src/js/worker/routes.js",
        ]
        insert_pos = res.index("/web_pwa_oca/static/src/js/worker/pwa.js") + 1
        for index, url in enumerate(to_insert):
            res.insert(insert_pos + index, url)

        insert_pos = res.index("/web/static/lib/underscore/underscore.js") + 1
        res.insert(
            insert_pos, "/web/static/lib/underscore.string/lib/underscore.string.js"
        )
        return res

    def _get_base_urls(self, cache_version):
        from odoo.addons.web.controllers.main import module_boot

        url_qweb_modules = "/web/webclient/qweb/{}?mods={}".format(
            cache_version, ",".join(module_boot())
        )
        return [
            # Cache main page
            "/web",
            # Cache favicon
            "/web/static/src/img/favicon.ico",
            # Cache manifest
            "/web_pwa_oca/manifest.webmanifest",
            "/web_pwa_oca/static/img/icons/icon-128x128.png",
            "/web_pwa_oca/static/img/icons/icon-144x144.png",
            "/web_pwa_oca/static/img/icons/icon-152x152.png",
            "/web_pwa_oca/static/img/icons/icon-192x192.png",
            "/web_pwa_oca/static/img/icons/icon-256x256.png",
            "/web_pwa_oca/static/img/icons/icon-512x512.png",
            # Cache qweb mods
            url_qweb_modules,
            # Necessary assets
            "/web_pwa_cache/static/src/xml/base.xml",
            "/web_pwa_cache/static/src/scss/main.scss",
            "/web/static/src/xml/base.xml",
            "/web/static/src/xml/chart.xml",
            "/web/static/src/xml/colorpicker_dialog.xml",
            "/web/static/src/xml/crash_manager.xml",
            "/web/static/src/xml/debug.xml",
            "/web/static/src/xml/dialog.xml",
            "/web/static/src/xml/kanban.xml",
            "/web/static/src/xml/menu.xml",
            "/web/static/src/xml/name_and_signature.xml",
            "/web/static/src/xml/notification.xml",
            "/web/static/src/xml/rainbow_man.xml",
            "/web/static/src/xml/report.xml",
            "/web/static/src/xml/ribbon.xml",
            "/web/static/src/xml/translation_dialog.xml",
            "/web/static/src/xml/web_calendar.xml",
            "/web/static/src/img/spin.png",
            "/web/static/src/img/smiling_face.svg",
            "/web/static/src/img/placeholder.png",
            "/web/static/src/img/empty_folder.svg",
            "/web/static/src/img/form_sheetbg.png",
            # Cache locale
            "/web/webclient/locale/{}".format(request.env.user.lang),
            # Boostrap assets
            "/web/static/lib/fontawesome/fonts/fontawesome-webfont.woff?v=4.7.0",
            "/web/static/lib/fontawesome/fonts/fontawesome-webfont.woff2?v=4.7.0",
            "/web/static/lib/fontawesome/fonts/fontawesome-webfont.ttf?v=4.7.0",
            # Full Calendar assets
            "/web/static/lib/fullcalendar/js/fullcalendar.js",
            "/web/static/lib/fullcalendar/css/fullcalendar.css",
            # Mobile resources
            "/web/static/lib/jquery.touchSwipe/jquery.touchSwipe.js",
        ]

    def _get_pwa_params(self):
        res = super()._get_pwa_params()

        urls = []
        urls.extend(self._get_asset_urls("web.assets_common"))
        urls.extend(self._get_asset_urls("web.assets_backend"))
        urls.extend(self._get_asset_urls("web_editor.summernote"))
        urls.extend(self._get_asset_urls("web_editor.assets_wysiwyg"))
        version_list = []
        for url in urls:
            version_list.append(url.split("/")[3])
        cache_version = "-".join(version_list)
        urls.extend(self._get_base_urls(cache_version))
        res["cache_name"] = cache_version
        res["prefetched_urls"] = list(set(urls))

        # Add 'GET' resources
        pwa_cache_obj = request.env["pwa.cache"]
        records = pwa_cache_obj.search(self._get_pwa_cache_domain(["get"]))
        res["prefetched_urls"] += pwa_cache_obj._get_text_field_lines(
            records, "get_urls"
        )
        return res

    @route(
        "/web_pwa_cache/static/src/js/worker/lib/sqlite/dist/sql-wasm.wasm",
        type="http",
        auth="public",
    )
    def pwa_sql_wasm(self):
        """Force mimetype to application/wasm"""
        placeholder = functools.partial(
            get_resource_path, "web_pwa_cache", "static", "src", "js", "sqlite", "dist",
        )
        return http.send_file(placeholder("sql-wasm.wasm"), mimetype="application/wasm")
