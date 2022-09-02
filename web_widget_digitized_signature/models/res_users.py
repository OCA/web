# Copyright 2004-2010 OpenERP SA (<http://www.openerp.com>)
# Copyright 2011-2015 Serpent Consulting Services Pvt. Ltd.
# Copyright 2017 Tecnativa - Vicent Cubells
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).


from odoo import api, fields, models


class ResUsers(models.Model):
    _name = "res.users"
    _inherit = ["res.users", "mail.thread"]

    digital_signature = fields.Image(
        oldname="signature_image",
        copy=False,
        attachment=True,
        max_width=1024,
        max_height=1024,
    )

    @api.model
    def create(self, vals):
        res = super(ResUsers, self).create(vals)
        res._track_signature(vals, "digital_signature")
        return res

    def write(self, vals):
        self._track_signature(vals, "digital_signature")
        return super(ResUsers, self).write(vals)

    def clear_digital_signature(self):
        self.digital_signature = False

    @property
    def SELF_READABLE_FIELDS(self):
        return super().SELF_READABLE_FIELDS + ["digital_signature"]

    @property
    def SELF_WRITEABLE_FIELDS(self):
        return super().SELF_WRITEABLE_FIELDS + ["digital_signature"]
