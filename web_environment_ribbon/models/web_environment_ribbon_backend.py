# Copyright 2017 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

import os

from odoo import api, models
from odoo.tools.config import config


class WebEnvironmentRibbonBackend(models.AbstractModel):
    _name = "web.environment.ribbon.backend"
    _description = "Web Environment Ribbon Backend"

    @api.model
    def _prepare_ribbon_format_vals(self):
        running_env = (
            config.get("running_env")
            or os.environ.get("RUNNING_ENV")
            or os.environ.get("ODOO_STAGE")
            or "test"
        )
        return {
            "db_name": self.env.cr.dbname,
            "running_env": running_env,
        }

    @api.model
    def _prepare_ribbon_name(self):
        name_tmpl = self.env["ir.config_parameter"].sudo().get_param("ribbon.name")
        vals = self._prepare_ribbon_format_vals()
        return name_tmpl and name_tmpl.format(**vals) or name_tmpl

    @api.model
    def get_environment_ribbon(self):
        """
        This method returns the ribbon data from ir config parameters
        :return: dictionary
        """
        ir_config_model = self.env["ir.config_parameter"]
        name = self._prepare_ribbon_name()
        return {
            "name": name,
            "color": ir_config_model.sudo().get_param("ribbon.color"),
            "background_color": ir_config_model.sudo().get_param(
                "ribbon.background.color"
            ),
        }
