# Copyright 2019 Siddharth Bhalgami <siddharth.bhalgami@gmail.com>
# Copyright 2019-Today: Druidoo (<https://www.druidoo.io>)
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

from odoo import api, models


class IrConfigParameter(models.Model):
    _inherit = "ir.config_parameter"

    @api.model
    def get_webcam_flash_fallback_mode_config(self):
        return self.sudo().get_param(
            "web_widget_image_webcam.flash_fallback_mode", default=False
        )
