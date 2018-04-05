from odoo import models, api, fields


class X2MDemo(models.Model):
    _name = 'x2m.demo'

    name = fields.Char()
    line_ids = fields.One2many('x2m.demo.line', 'demo_id')

    @api.multi
    def open_x2m_matrix(self):
        wiz = self.env['x2m.matrix.demo.wiz'].create({})
        return {
            'name': 'Try x2many 2D matrix widget',
            'type': 'ir.actions.act_window',
            'view_type': 'form',
            'view_mode': 'form',
            'res_model': 'x2m.matrix.demo.wiz',
            'target': 'new',
            'res_id': wiz.id,
            'context': self.env.context,
        }


class X2MDemoLine(models.Model):
    _name = 'x2m.demo.line'

    name = fields.Char()
    demo_id = fields.Many2one('x2m.demo')
    user_id = fields.Many2one('res.users')
    value = fields.Integer()
