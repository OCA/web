# Copyright 2022 Camptocamp SA (https://www.camptocamp.com).
# @author Iván Todorovich <ivan.todorovich@camptocamp.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, models


class IrConfigParameter(models.Model):
    _inherit = "ir.config_parameter"

    @api.model
    def get_web_widget_ckeditor_config(self):
        get_param = self.sudo().get_param
        return {
            "toolbar": get_param("web_widget_ckeditor.toolbar"),
        }
