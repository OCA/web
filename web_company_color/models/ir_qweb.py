# Copyright 2020 Alexandre Díaz <dev@redneboa.es>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from odoo import models

from .assetsbundle import AssetsBundleCompanyColor


class QWeb(models.AbstractModel):
    _inherit = "ir.qweb"

    def _generate_asset_links_cache(
        self, bundle, css=True, js=True, assets_params=None, rtl=False
    ):
        res = super()._generate_asset_links_cache(bundle, css, js, assets_params, rtl)
        if bundle == "web_company_color.company_color_assets":
            asset = AssetsBundleCompanyColor(
                bundle,
                [],
                env=self.env,
                css=True,
                js=True,
                debug_assets=False,
                rtl=rtl,
                assets_params=assets_params,
            )
            res += [asset.get_company_color_asset_node()]
        return res

    def _get_asset_content(self, bundle, assets_params=None):
        """Handle 'special' web_company_color bundle"""
        if bundle == "web_company_color.company_color_assets":
            return [], []
        return super()._get_asset_content(bundle, assets_params=assets_params)
