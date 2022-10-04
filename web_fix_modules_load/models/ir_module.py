# Copyright 2022 Camptocamp SA
# @author Simone Orsi <simahawk@gmail.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

import json

from odoo import models

from odoo.addons.web.controllers.main import module_boot


class IrModule(models.Model):
    _inherit = "ir.module.module"

    def _session_modules_info(self):
        """Load modules info and return their mapping."""
        module_names = module_boot(self.env.cr.dbname)
        modules = self.sudo().search([("name", "in", module_names)])
        data = {mod.name: {"id": mod.id} for mod in modules}
        return json.dumps(data)
