# -*- coding: utf-8 -*-
# © 2016 Eficent Business and IT Consulting Services S.L.
#   (http://www.eficent.com)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).

from openerp import fields, models


class PlannedHoursByUserProject(models.TransientModel):
    _name = 'planned.hours.user.project'

    def _default_task_ids(self):
        # your list of project should come from the context, some selection
        # in a previous wizard or wherever else
        projects = self.env['project.project'].browse(
            [self.env.ref('project.project_project_1').id])
        # same with users
        users = self.env['res.users'].browse([self.env.ref(
            'base.user_demo').id])
        return [
            (0, 0, {'project_id': p.id, 'user_id': u.id, 'planned_hours': 0})
            # if the project doesn't have a task for the user, create a new one
            if not p.task_ids.filtered(lambda x: x.user_id == u) else
            # otherwise, return the task
            (4, p.task_ids.filtered(lambda x: x.user_id == u)[0].id)
            for p in projects
            for u in users
            ]
    task_ids = fields.Many2many('project.task', default=_default_task_ids)
