from odoo import models, api


class ImBus(models.Model):

    _inherit = 'bus.bus'

    @api.model
    def sendone(self, channel, message):
        if channel == 'web_auto_refresh':
            channel = (self._cr.dbname, channel, self.env.user.partner_id.id)
        super(ImBus, self).sendone(channel, message)
