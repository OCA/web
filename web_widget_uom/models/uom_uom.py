# Copyright 2019 Eficent Business and IT Consulting Services S.L.
#   (http://www.eficent.com)

from odoo import fields, models, api


class UoM(models.Model):
    _inherit = 'uom.uom'

    decimal_places = fields.Integer(
        string="Decimal Places", default=2)

    _sql_constraints = [
        ('uom_decimal_places_positive', 'CHECK(decimal_places >= 0)',
         'Decimal places must be strictly bigger or equal than one'),
    ]

    @api.multi
    def get_decimal_places(self, id):
        return self.env['uom.uom'].browse(id).decimal_places
