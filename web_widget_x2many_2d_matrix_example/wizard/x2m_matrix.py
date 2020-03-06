# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from odoo import fields, models


class X2mMatrixDemoWiz(models.TransientModel):
    _name = "x2m.matrix.demo.wiz"
    _description = "X2Many Matrix Demo Wizard"

    line_ids = fields.Many2many(
        "x2m.demo.line", default=lambda self: self._default_line_ids()
    )

    def _default_line_ids(self):
        """take care that the widget gets records passed for every combination
        of x2m.demo and res.users involved"""
        recs = self.env["x2m.demo"].search([])
        users = self.env["x2m.demo.line"].search([]).mapped("user_id")
        return [
            (
                0,
                0,
                {
                    "name": "{}'s task on {}".format(usr.name, rec.name),
                    "demo_id": rec.id,
                    "user_id": usr.id,
                },
            )
            # if there isn't a demo line record for the user, create a new one
            if not rec.line_ids.filtered(lambda x: x.user_id == usr) else
            # otherwise, return the line
            (4, rec.line_ids.filtered(lambda x: x.user_id == usr)[0].id)
            for rec in recs
            for usr in users
        ]
