# Copyright 2020 Alexandre Díaz <dev@redneboa.es>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from odoo.addons.base.models.assetsbundle import AssetsBundle


class AssetsBundleCompanyColor(AssetsBundle):
    def get_company_color_asset_node(self):
        """Process the user active company scss and returns the node to inject"""
        company = self.env["res.company"]._get_company_color_active_company()
        return company.scss_get_url()
