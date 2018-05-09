from odoo import fields, models


class DemoWizard(models.TransientModel):
    _name = 'x2m.matrix.demo.wiz'

    line_ids = fields.Many2many(
        'x2m.demo.line', default=lambda self: self._default_line_ids())

    def _default_line_ids(self):
        recs = self.env['x2m.demo'].search([])
        # same with users
        users = self.env['x2m.demo.line'].search([]).mapped('user_id')
        return [
            (0, 0, {
                'name': "{}'s task on {}".format(usr.name, rec.name),
                'demo_id': rec.id,
                'user_id': usr.id,
                'value': 0,
            })
            # if the project doesn't have a task for the user, create a new one
            if not rec.line_ids.filtered(lambda x: x.user_id == usr) else
            # otherwise, return the task
            (4, rec.line_ids.filtered(lambda x: x.user_id == usr)[0].id)
            for rec in recs
            for usr in users
        ]
