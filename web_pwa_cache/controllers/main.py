# Copyright 2020 Tecnativa - Alexandre D. Díaz
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

import functools
import hashlib
import json
import logging
import mimetypes
import urllib.parse

from odoo import http
from odoo.http import request, route
from odoo.modules import get_resource_path
from odoo.tools import ustr

from odoo.addons.web.controllers.main import HomeStaticTemplateHelpers, module_boot
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

    def _get_base_urls(self, cache_hashes):
        url_qweb_modules = "/web/webclient/qweb/{}?mods={}".format(
            cache_hashes["qweb"], ",".join(module_boot())
        )
        url_load_menus = "/web/webclient/load_menus/{}".format(
            cache_hashes["load_menus"]
        )
        url_translations = "/web/webclient/translations/{}?mods={}&lang={}".format(
            cache_hashes["translations"],
            urllib.parse.quote(",".join(module_boot())),
            request.env.user.lang,
        )
        return [
            # Cache base assets
            "/base/static/img/company_image.png",
            "/base/static/img/avatar_grey.png",
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
            # Cache menus
            url_load_menus,
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
            "/web/static/src/img/user_menu_avatar.png",
            # Cache locale
            "/web/webclient/locale/{}".format(request.env.user.lang),
            url_translations,
            # Boostrap assets
            "/web/static/lib/fontawesome/fonts/fontawesome-webfont.woff?v=4.7.0",
            "/web/static/lib/fontawesome/fonts/fontawesome-webfont.woff2?v=4.7.0",
            "/web/static/lib/fontawesome/fonts/fontawesome-webfont.ttf?v=4.7.0",
            # Full Calendar assets
            "/web/static/lib/fullcalendar/js/fullcalendar.js",
            "/web/static/lib/fullcalendar/css/fullcalendar.css",
            # Mobile resources
            "/web/static/lib/jquery.touchSwipe/jquery.touchSwipe.js",
            # Partner
            # "/partner_autocomplete/static/lib/jsvat.js",
        ]

    def _get_pwa_cache_hashes(self):
        mods = module_boot()
        qweb_checksum = HomeStaticTemplateHelpers.get_qweb_templates_checksum(
            addons=mods, debug=request.session.debug
        )
        user_context = request.session.get_context() if request.session.uid else {}
        lang = user_context.get("lang")
        translation_hash = request.env["ir.translation"].get_web_translations_hash(
            mods, lang
        )
        menu_json_utf8 = json.dumps(
            request.env["ir.ui.menu"].load_menus(request.session.debug),
            default=ustr,
            sort_keys=True,
        ).encode()

        hashes = {
            "load_menus": hashlib.sha1(menu_json_utf8).hexdigest(),
            "qweb": qweb_checksum,
            "translations": translation_hash,
        }
        hashes["pwa"] = "-".join(list(hashes.values()))
        return hashes

    @route(
        "/web_pwa_cache/static/src/lib/sqlite/dist/sql-wasm.wasm",
        type="http",
        auth="public",
    )
    def pwa_sql_wasm(self):
        """Force mimetype to application/wasm"""
        placeholder = functools.partial(
            get_resource_path,
            "web_pwa_cache",
            "static",
            "src",
            "lib",
            "sqlite",
            "dist",
        )
        return http.send_file(placeholder("sql-wasm.wasm"), mimetype="application/wasm")

    @route(
        "/web_pwa_cache/cache/version", type="json", auth="user",
    )
    def pwa_cache_version(self):
        cache_version = (
            request.env["ir.config_parameter"].sudo().get_param("pwa.cache.version")
        )
        return cache_version
