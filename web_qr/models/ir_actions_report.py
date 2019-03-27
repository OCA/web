from odoo import api, models
import qrcode
import io


class IrActionsReport(models.Model):
    _inherit = 'ir.actions.report'

    @api.model
    def qr_generate(self, value, box_size=3, border=5, **kwargs):
        try:
            qr = qrcode.make(value, box_size=box_size, border=border, **kwargs)
            arr = io.BytesIO()
            qr.save(arr, format='png')
            return arr.getvalue()
        except (ValueError, AttributeError):
            raise ValueError("Cannot convert into barcode.")
