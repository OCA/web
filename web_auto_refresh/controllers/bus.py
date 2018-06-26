# -*- coding: utf-8 -*-
# Copyright 2018 Kmee Informática
# Gabriel Cardoso de Faria <gabriel.cardoso@kmee.com.br>
# Fisher Yu <szufisher@gmail.com>
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).
from odoo.http import request
from odoo.addons.bus.controllers.main import BusController


class Bus(BusController):

    # --------------------------
    # Extends BUS Controller Poll
    # --------------------------
    def _poll(self, dbname, channels, last, options):
        if request.session.uid:
            partner_id = request.env.user.partner_id.id
            if partner_id:
                channels = list(channels)
                channels.append((request.db, 'web_auto_refresh', partner_id))
        return super(Bus, self)._poll(dbname, channels, last, options)
