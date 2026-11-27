# Copyright 2026 Binhex - Rolando Pérez Rebollo
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from odoo import api, models


class IrAttachment(models.Model):
    _inherit = "ir.attachment"

    @api.model
    def _get_pwa_icon(self):
        """Return the base PWA icon as Odoo serves it."""
        for url in ("/web_pwa_customize/icon.svg", "/web_pwa_customize/icon.png"):
            icon = self._get_serve_attachment(url)
            if icon:
                return icon
        return self.browse()
