# © 2024 initOS GmbH
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
import logging
import mimetypes
import os
import re

from odoo import models

from odoo.addons.web.models.ir_http import ALLOWED_DEBUG_MODES

_logger = logging.getLogger(__name__)

# Failsafe because it has the potential to lock everyone out of the UI
if "unfiltered" not in ALLOWED_DEBUG_MODES:
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

    def _get_asset_nodes(
        self,
        bundle,
        css=True,
        js=True,
        debug=False,
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

        skip_filtering = bool(debug and "unfiltered" in debug)
        if assets and not skip_filtering:
            bundle += f"|{assets.hashsum}"

        return super(
            IrQweb,
            self.with_context(
                bundle_skip_filtering=skip_filtering,
            ),
        )._get_asset_nodes(
            bundle,
            css=css,
            js=js,
            debug=debug,
            defer_load=defer_load,
            lazy_load=lazy_load,
            media=media,
        )

    def _get_asset_content(self, bundle, assets_params=None):
        # Extract and strip the hashsum suffix appended by _get_asset_nodes
        hashsum = None
        if "|" in bundle:
            bundle, hashsum = bundle.rsplit("|", 1)

        files, external_assets = super()._get_asset_content(
            bundle, assets_params=assets_params
        )

        skip = self.env.context.get("bundle_skip_filtering")
        if not hashsum or skip:
            return files, external_assets

        urls = {f["url"]: f for f in files}

        # Synchronize web.assets.file records with the actual bundle file list
        assets = self.env["web.assets"].sudo().search([("bundle", "=", bundle)])
        assets.mapped("file_ids").filtered_domain(
            [("name", "not in", list(urls))]
        ).unlink()

        asset_files = assets.mapped("file_ids")
        for url, data in urls.items():
            asset_files.filtered_domain([("name", "=", url)]).write(
                {"size": filesize(data.get("filename", ""))}
            )

        for asset in assets:
            for file_url in set(urls) - set(asset.mapped("file_ids.name")):
                data = urls[file_url]
                mimetype = mimetypes.guess_type(file_url)[0] or ""
                asset.file_ids.create(
                    {
                        "asset_id": asset.id,
                        "name": file_url,
                        "mimetype": mimetype,
                        "include": True,
                        "size": filesize(data.get("filename", "")),
                    }
                )

        # Filter the file list to only the files enabled in the matching config
        domain = [
            ("bundle", "=", bundle),
            ("hashsum", "=", hashsum),
            ("active", "=", True),
        ]
        assets = assets.search(domain, limit=1)
        names = set(assets.mapped("file_ids").filtered("include").mapped("name"))
        return [f for f in files if f["url"] in names], external_assets
