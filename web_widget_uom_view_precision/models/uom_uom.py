from odoo import models, fields

class UomUom(models.Model):
    _inherit = 'uom.uom'

    view_precision = fields.Integer('View Precision',
                                    default=3,
                                    help="Number of digits after the decimal separator when displaying the value"
                                         " for this unit of measure. Default is 3.")

    _sql_constraints = [
        ('uom_view_precision_positive', 'CHECK(view_precision >= 0)',
         'View precision must be bigger or equal than zero'),
    ]
