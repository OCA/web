# Copyright 2019 Eficent Business and IT Consulting Services S.L.
#   (http://www.eficent.com)
# Copyright 2022 - Giovanni Serra
import decimal

from odoo import _, api, fields, models


class UoM(models.Model):
    _inherit = "uom.uom"

    decimal_places = fields.Integer(
        string="Decimal Places",
        default=2,
    )

    show_only_inputed_decimals = fields.Boolean(
        "Show only inputed decimals",
        default=False,
        help="It shows only inputed decimals up to Decimal Places",
    )

    @api.onchange("decimal_places")
    def _onchange_decimal_places(self):
        decimal_accuracy = self.env["decimal.precision"].precision_get(
            "Product Unit of Measure"
        )

        if self.decimal_places > decimal_accuracy:
            return {
                "warning": {
                    "title": _("Warning!"),
                    "message": _(
                        "The Decimal places is higher than the Decimal Accuracy"
                        " (%s digits).\nThis may cause inconsistencies in computations.\n"
                        "Please set Decimal Places between 0 and %s."
                    )
                    % (decimal_accuracy, decimal_accuracy),
                }
            }

    _sql_constraints = [
        (
            "uom_decimal_places_positive",
            "CHECK(decimal_places >= 0)",
            "Decimal places must be strictly bigger or equal than zero",
        ),
    ]

    def get_decimal_places(self, uom_id, value):
        uom = self.env["uom.uom"].browse(uom_id)
        decimal_places = uom.decimal_places
        if uom.show_only_inputed_decimals:
            digits = (
                0
                if isinstance(value, int)
                else abs(decimal.Decimal(str(value)).as_tuple().exponent)
            )
            decimal_places = min(decimal_places, digits)
        return decimal_places
