# -*- coding: utf-8 -*-
# Copyright 2018 Kmee Informática
# Gabriel Cardoso de Faria <gabriel.cardoso@kmee.com.br>
# Fisher Yu <szufisher@gmail.com>
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).
from odoo import models, api


class ImBus(models.Model):

    _inherit = 'bus.bus'

    @api.model
    def sendone(self, channel, message):
        if channel == 'web_auto_refresh':
            channel = (self._cr.dbname, channel, self.env.user.partner_id.id)
        super(ImBus, self).sendone(channel, message)
