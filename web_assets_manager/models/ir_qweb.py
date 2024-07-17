# © 2024 initOS GmbH
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
import logging
import os
import re

from odoo import models
from odoo.http import ALLOWED_DEBUG_MODES

_logger = logging.getLogger(__name__)

# Failsafe because it has the potential to lock everyone out of the UI
ALLOWED_DEBUG_MODES.append("unfiltered")


def filesize(filename):
    if not filename:
        return 0

    if not os.path.isfile(filename):
        return 0

    try:
        with open(filename, "rb") as fp:
            fp.seek(0, 2)
            return fp.tell()
    except Exception:
        return 0


class IrQweb(models.AbstractModel):
    _inherit = "ir.qweb"

    def _generate_asset_nodes(
        self,
        bundle,
        css=True,
        js=True,
        debug=False,
        async_load=False,
        defer_load=False,
        lazy_load=False,
        media=None,
    ):

        if "|" in bundle:
            bundle = bundle.rsplit("|", 1)[0]

        return super()._generate_asset_nodes(
            bundle,
            css=css,
            js=js,
            debug=debug,
            async_load=async_load,
            defer_load=defer_load,
            lazy_load=lazy_load,
            media=media,
        )

    def get_asset_bundle(self, bundle_name, files, env=None, css=True, js=True):
        if "|" in bundle_name:
            bundle_name = bundle_name.rsplit("|", 1)[0]

        hashsum = self.env.context.get("bundle_hashsum")
        skip = self.env.context.get("bundle_skip_filtering")
        if not hashsum or skip:
            return super().get_asset_bundle(bundle_name, files, env=env, css=css, js=js)

        urls = {a["url"]: a for a in files}

        # Synchronize assets files
        assets = self.env["web.assets"].sudo().search([("bundle", "=", bundle_name)])
        assets.mapped("file_ids").filtered_domain(
            [("name", "not in", list(urls))]
        ).unlink()

        asset_files = assets.mapped("file_ids")
        for url, data in urls.items():
            asset_files.filtered_domain([("name", "=", url)]).write(
                {"size": filesize(data.get("filename", ""))}
            )

        for asset in assets:
            for file in set(urls) - set(asset.mapped("file_ids.name")):
                data = urls[file]

                asset.file_ids.create(
                    {
                        "asset_id": asset.id,
                        "name": file,
                        "mimetype": data["atype"],
                        "include": True,
                        "size": filesize(data.get("filename", "")),
                    }
                )

        # Filter the assets files
        domain = [
            ("bundle", "=", bundle_name),
            ("hashsum", "=", hashsum),
            ("active", "=", True),
        ]
        assets = assets.search(domain, limit=1)
        names = set(assets.mapped("file_ids").filtered("include").mapped("name"))
        return super().get_asset_bundle(
            bundle_name,
            [file for file in files if file["url"] in names],
            env=env,
            css=css,
            js=js,
        )

    def _get_asset_nodes(
        self,
        bundle,
        css=True,
        js=True,
        debug=False,
        async_load=False,
        defer_load=False,
        lazy_load=False,
        media=None,
    ):
        path = None
        assets = self.env["web.assets"].sudo()
        try:
            from odoo.http import request

            path = request.httprequest.path
        except RuntimeError:  # pylint: disable=except-pass
            pass

        if path:
            domain = [
                ("bundle", "=", bundle),
                ("active", "=", True),
                ("path_regex", "!=", False),
            ]
            for rec in assets.search(domain):
                pattern = r"^" + rec.path_regex.strip(r"^")
                if re.match(pattern, path):
                    assets = rec
                    break

        if assets:
            bundle += f"|{assets.hashsum}"

        return super(
            IrQweb,
            self.with_context(
                bundle_hashsum=assets.hashsum,
                bundle_skip_filtering=debug and "unfiltered" in debug,
            ),
        )._get_asset_nodes(
            bundle,
            css=css,
            js=js,
            debug=debug,
            async_load=async_load,
            defer_load=defer_load,
            lazy_load=lazy_load,
            media=media,
        )
