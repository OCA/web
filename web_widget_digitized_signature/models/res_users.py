# -*- coding: utf-8 -*-
# Copyright 2004-2010 OpenERP SA (<http://www.openerp.com>)
# Copyright 2011-2015 Serpent Consulting Services Pvt. Ltd.
# Copyright 2017 Tecnativa - Vicent Cubells
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import models, fields


class Users(models.Model):
    _name = 'res.users'
    _inherit = 'res.users'

    signature_image = fields.Binary(
        string='Signature',
    )
