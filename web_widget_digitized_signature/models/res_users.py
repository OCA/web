# Copyright 2004-2010 OpenERP SA (<http://www.openerp.com>)
# Copyright 2011-2015 Serpent Consulting Services Pvt. Ltd.
# Copyright 2017 Tecnativa - Vicent Cubells
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, fields, models


class ResUsers(models.Model):
    _name = 'res.users'
    _inherit = ['res.users', 'mail.thread']

    digital_signature = fields.Binary(string='Digital Signature',
                                      oldname="signature_image",
                                      attachment=True)

    @api.model
    def create(self, vals):
        res = super(ResUsers, self).create(vals)
        res._track_signature(vals, 'digital_signature')
        return res

    @api.multi
    def write(self, vals):
        self._track_signature(vals, 'digital_signature')
        return super(ResUsers, self).write(vals)

    def __init__(self, pool, cr):
        super(ResUsers, self).__init__(pool, cr)
        # duplicate list to avoid modifying the original reference
        type(self).SELF_WRITEABLE_FIELDS = list(self.SELF_WRITEABLE_FIELDS)
        type(self).SELF_WRITEABLE_FIELDS.extend(['digital_signature'])
        # duplicate list to avoid modifying the original reference
        type(self).SELF_READABLE_FIELDS = list(self.SELF_READABLE_FIELDS)
        type(self).SELF_READABLE_FIELDS.extend(['digital_signature'])
