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
        # Call `_get_asset_nodes` as done when printing a report based on
        # `web.report_layout` template (used by `web.html_container`)
        options = {
            "commit_assetsbundle": False,
            "debug": False,
            "inherit_branding": False,
            "dev_mode": False,
            "caller_template": "web.html_container",
        }
        assets_template_ids = [
            "web.report_assets_common",
            "web.assets_common",
            "web.report_assets_pdf",
        ]
        for xml_id in assets_template_ids:
            self.env["ir.qweb"]._get_asset_nodes(
                xmlid=xml_id, options=options, css=True, js=True
            )
        logger.info("Ensure that assets are generated and stored in the database: done")
        return True
