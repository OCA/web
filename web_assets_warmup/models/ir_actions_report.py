# Copyright 2020 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl)

import logging

from odoo import api, models

logger = logging.getLogger(__name__)


class IrActionsReport(models.Model):
    _inherit = "ir.actions.report"

    @api.model
    def cron_generate_assets(self):
        """Ensure that the assets are well-generated in the database."""
        logger.info("Ensure that assets are generated and stored in the database...")
        bundles = [
            "web.report_assets_common",
            "web.report_assets_pdf",
        ]
        for bundle in bundles:
            files = self.env["ir.qweb"]._get_asset_bundle(bundle, css=True, js=True)
            files.js()
            files.css()
        logger.info("Ensure that assets are generated and stored in the database: done")
        return True
