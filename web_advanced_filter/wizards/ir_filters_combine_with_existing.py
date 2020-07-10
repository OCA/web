# Copyright 2014 Therp BV <https://therp.nl>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).
import time
import json
from odoo import api, fields, models
from odoo.osv import expression
from odoo.tools.safe_eval import safe_eval


class IrFiltersCombineWithExisting(models.TransientModel):
    _name = 'ir.filters.combine.with.existing'
    _description = 'Combine a selection with an existing filter'

    action = fields.Selection(
        [('union', 'Union'), ('complement', 'Complement')],
        'Action', required=True,
    )
    domain = fields.Char('Domain', required=True)
    context = fields.Char('Context', required=True, default='{}')
    model = fields.Char('Model', required=True)
    filter_id = fields.Many2one('ir.filters', 'Filter', required=True)

    @api.multi
    def button_save(self):
        self.ensure_one()
        domain = json.loads(self.domain)
        is_frozen = (
            len(domain) == 1
            and expression.is_leaf(domain[0])
            and domain[0][0] == "id"
            and domain[0][1] == "in"
        )

        if self.action == 'union':
            if is_frozen and self.filter_id.is_frozen:
                domain[0][2] = list(set(domain[0][2]).union(
                    set(safe_eval(self.filter_id.domain)[0][2])))
                self.filter_id.write({'domain': repr(domain)})
            else:
                self.filter_id.write({
                    'union_filter_ids': [(0, 0, {
                        'name': '%s_%s_%d' % (
                            self.filter_id.name, 'add', time.time()),
                        'active': False,
                        'domain': repr(domain),
                        'context': repr(json.loads(self.context)),
                        'model_id': self.model,
                        'user_id': self.filter_id.user_id.id or False,
                    })],
                })
        elif self.action == 'complement':
            if is_frozen and self.filter_id.is_frozen:
                complement_set = set(safe_eval(self.filter_id.domain)[0][2])
                domain[0][2] = list(
                    complement_set.difference(set(domain[0][2])))
                self.filter_id.write({'domain': repr(domain)})
            else:
                self.filter_id.write({
                    'complement_filter_ids': [(0, 0, {
                        'name': '%s_%s_%d' % (
                            self.filter_id.name, 'remove', time.time()),
                        'active': False,
                        'domain': repr(domain),
                        'context': repr(json.loads(self.context)),
                        'model_id': self.model,
                        'user_id': self.filter_id.user_id.id or False,
                    })],
                })

        return {'type': 'ir.actions.act_window_close'}
