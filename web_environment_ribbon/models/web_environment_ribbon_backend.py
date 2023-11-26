# Copyright 2017 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import api, models
from odoo.tools.safe_eval import safe_eval


class WebEnvironmentRibbonBackend(models.AbstractModel):

    _name = "web.environment.ribbon.backend"
    _description = "Web Environment Ribbon Backend"

    @api.model
    def _prepare_ribbon_format_vals(self):
        return {"db_name": self.env.cr.dbname}

    @api.model
    def _prepare_ribbon_eval_environment(self):
        return {"env": self.env}

    @api.model
    def _get_ribbon_value(self, name):
        ir_config_model = self.env["ir.config_parameter"].sudo()
        code = ir_config_model.get_param("ribbon.%s.code" % name)
        if code:
            return safe_eval(
                code, globals_dict=self._prepare_ribbon_eval_environment(),
            )
        value_tmpl = ir_config_model.get_param("ribbon.%s" % name)
        vals = self._prepare_ribbon_format_vals()
        return value_tmpl and value_tmpl.format(**vals) or value_tmpl

    @api.model
    def get_environment_ribbon(self):
        """
        This method returns the ribbon data from ir config parameters
        :return: dictionary
        """
        return {
            "name": self._get_ribbon_value("name"),
            "color": self._get_ribbon_value("color"),
            "background_color": self._get_ribbon_value("background.color"),
        }
