# Copyright 2022 Camptocamp SA
# @author Simone Orsi <simahawk@gmail.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).


from odoo import models


class IrTranslation(models.Model):
    _inherit = "ir.translation"

    def get_translations_for_webclient(self, mods, lang):
        # Intercept call to load translations from modules' ids instead of names.
        if mods and isinstance(mods[0], int):
            model = self.env["ir.module.module"].sudo()
            mods = model.browse(mods).mapped("name")
        return super().get_translations_for_webclient(mods, lang)
