# -*- coding: utf-8 -*-
# Copyright 2016 LasLabs Inc.
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

from openerp import api, fields, models


class WebKanbanAbstract(models.AbstractModel):
    '''Inherit from this class to add support for Kanban stages to your model.
    All public properties are preceded with kanban_ in order to isolate from
    child models, with the exception of stage_id, which is a required field in
    the Kanban widget and must be defined as such.'''

    _name = 'web.kanban.abstract'
    _order = 'kanban_priority desc, kanban_sequence'
    _group_by_full = {
        'stage_id': lambda s, *a, **k: s._read_group_stage_ids(*a, **k),
    }

    kanban_sequence = fields.Integer(
        default=10,
        index=True,
        help='Order of record in relation to other records in the same Kanban'
             ' stage and with the same priority',
    )
    kanban_priority = fields.Selection(
        selection=[('0', 'Normal'), ('5', 'Medium'), ('10', 'High')],
        index=True,
        default='0',
        help='The priority of the record (shown as stars in Kanban views)',
    )
    stage_id = fields.Many2one(
        string='Kanban Stage',
        comodel_name='web.kanban.stage',
        track_visibility='onchange',
        index=True,
        copy=False,
        help='The Kanban stage that this record is currently in',
        default=lambda s: s._default_stage_id(),
        domain=lambda s: [('res_model.model', '=', s._name)],
    )
    kanban_user_id = fields.Many2one(
        string='Assigned To',
        comodel_name='res.users',
        index=True,
        track_visibility='onchange',
        help='User that the record is currently assigned to',
    )
    kanban_color = fields.Integer(
        string='Color Index',
        help='Color index to be used for the record\'s Kanban card',
    )
    kanban_legend_priority = fields.Text(
        string='Priority Explanation',
        related='stage_id.legend_priority',
        help='Explanation text to help users understand how the priority/star'
             ' mechanism applies to this record (depends on current stage)',
    )
    kanban_legend_blocked = fields.Text(
        string='Special Handling Explanation',
        related='stage_id.legend_blocked',
        help='Explanation text to help users understand how the special'
             ' handling status applies to this record (depends on current'
             ' stage)',
    )
    kanban_legend_done = fields.Text(
        string='Ready Explanation',
        related='stage_id.legend_done',
        help='Explanation text to help users understand how the ready'
             ' status applies to this record (depends on current stage)',
    )
    kanban_legend_normal = fields.Text(
        string='Normal Handling Explanation',
        related='stage_id.legend_normal',
        help='Explanation text to help users understand how the normal'
             ' handling status applies to this record (depends on current'
             ' stage)',
    )
    kanban_status = fields.Selection(
        selection=[
            ('normal', 'Normal Handling'),
            ('done', 'Ready'),
            ('blocked', 'Special Handling'),
        ],
        string='Kanban Status',
        default='normal',
        track_visibility='onchange',
        required=True,
        copy=False,
        help='A record can have one of several Kanban statuses, which are used'
             ' to indicate whether there are any special situations affecting'
             ' it. The exact meaning of each status is allowed to vary based'
             ' on the stage the record is in but they are roughly as follow:\n'
             '* Normal Handling: Default status, no special situations\n'
             '* Ready: Ready to transition to the next stage\n'
             '* Special Handling: Blocked in some way (e.g. must be handled by'
             ' a specific user)\n'
    )

    @api.model
    def _default_stage_id(self):
        return

    @api.multi
    def _read_group_stage_ids(
        self, domain=None, read_group_order=None, access_rights_uid=None
    ):
        stage_model = self.env['web.kanban.stage'].sudo(access_rights_uid)
        stages = stage_model.search([('res_model.model', '=', self._name)])
        names = [(r.id, r.display_name) for r in stages]
        fold = {r.id: r.fold for r in stages}
        return names, fold
