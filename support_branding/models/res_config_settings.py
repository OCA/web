# Copyright 2021 Sunflower IT
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    def get_values(self):
        res = super(ResConfigSettings, self).get_values()
        param_obj = self.env["ir.config_parameter"].sudo()
        res.update(
            support_company=param_obj.get_param("support_company"),
            support_company_url=param_obj.get_param("support_company_url"),
            support_email=param_obj.get_param("support_email"),
            support_release=param_obj.get_param("support_release"),
            support_branding_color=param_obj.get_param("support_branding_color"),
        )
        return res

    def set_values(self):
        res = super(ResConfigSettings, self).set_values()
        param_obj = self.env["ir.config_parameter"].sudo()
        param_obj.set_param("support_company", self.support_company)
        param_obj.set_param("support_company_url", self.support_company_url)
        param_obj.set_param("support_email", self.support_email)
        param_obj.set_param("support_release", self.support_release)
        param_obj.set_param("support_branding_color", self.support_branding_color)
        return res

    support_company = fields.Char(string="Company Name")
    support_company_url = fields.Char(string="Company URL")
    support_branding_color = fields.Char(string="Branding color")
    support_email = fields.Char(string="Support email")
    support_release = fields.Char(string="Support release")

    def test_support_branding_error(self):
        return 9 / 0
