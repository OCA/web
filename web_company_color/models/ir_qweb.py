# Copyright 2020 Alexandre Díaz <dev@redneboa.es>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from odoo import models

from .assetsbundle import AssetsBundleCompanyColor


class QWeb(models.AbstractModel):
    _inherit = "ir.qweb"

    def _get_asset_content(self, bundle, assets_params=None):
        """Handle 'special' web_company_color bundle"""
        if bundle == "web_company_color.company_color_assets":
            return [], []
        return super()._get_asset_content(bundle, assets_params=assets_params)

    def _get_asset_nodes(
        self,
        bundle,
        css=True,
        js=True,
        debug=False,
        defer_load=False,
        lazy_load=False,
        media=None,
        autoprefix=False,
    ):
        if bundle == "web_company_color.company_color_assets":
            if not css:
                return []
            # Company selection belongs to this request, never the shared
            # asset cache. Mutating cached links leaked previous companies'
            # styles into later pages, including companies with no overrides.
            asset = AssetsBundleCompanyColor(
                bundle, [], env=self.env, css=True, js=False
            )
            url = asset.get_company_color_asset_node()
            node = self._link_to_node(url, media=media)
            node[1].pop("type", None)
            return [node]
        return super()._get_asset_nodes(
            bundle,
            css=css,
            js=js,
            debug=debug,
            defer_load=defer_load,
            lazy_load=lazy_load,
            media=media,
            autoprefix=autoprefix,
        )
