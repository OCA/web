# -*- coding: utf-8 -*-
# Copyright 2004-2010 OpenERP SA (<http://www.openerp.com>)
# Copyright 2011-2015 Serpent Consulting Services Pvt. Ltd.
# Copyright 2017 Tecnativa - Vicent Cubells
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import api, fields, models


class ResUsers(models.Model):
    _name = 'res.users'
    _inherit = ['res.users', 'mail.thread']

    signature_image = fields.Binary(
        string='Signature',
    )

    @api.model
    def create(self, vals):
        res = super(ResUsers, self).create(vals)
        res._track_signature(vals, 'signature')
        return res

    @api.multi
    def write(self, vals):
        self._track_signature(vals, 'signature')
        return super(ResUsers, self).write(vals)
