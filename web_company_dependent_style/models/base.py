# © 2023 David BEAL @ Akretion
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, models


class Base(models.AbstractModel):
    _inherit = "base"

    @api.model
    def _get_view(self, view_id=None, view_type="form", **options):
        arch, view = super()._get_view(view_id, view_type, **options)
        if view_type == "form":
            self._update_company_dependent_css(arch)
        return arch, view

    def _update_company_dependent_css(self, arch):
        cpny_dep_fields = [
            x for x, y in self.env[self._name]._fields.items() if y.company_dependent
        ]
        for field_name in cpny_dep_fields:
            for field in arch.xpath(f"//field[@name='{field_name}']"):
                field.attrib["class"] = self._get_company_dependent_css_class()

    def _get_company_dependent_css_class(self):
        """Inherit me to apply your own class"""
        return "fa fa-building-o"
