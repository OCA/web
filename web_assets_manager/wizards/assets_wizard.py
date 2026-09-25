# © 2024 initOS GmbH
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

import base64

from odoo import fields, models


class AssetsWizard(models.TransientModel):
    _name = "web.assets.wizard"
    _description = "Wizard to Manage Web Assets"

    asset_id = fields.Many2one("web.assets", required=True)
    file = fields.Binary(attachment=False)
    filename = fields.Char()

    def action_upload(self):
        if not self.file:
            return

        content = base64.b64decode(self.file).decode()
        filelist = set(content.splitlines())
        for file in self.asset_id.file_ids:
            file.include = file.name in filelist
