# -*- coding: utf-8 -*-

from openerp.http import request
from openerp.addons.web.controllers.main import Session


class MainController(Session):

    def session_info(self):
        res = super(MainController, self).session_info()
        groups = request.env['ir.model.data'].sudo().search([
            ('model', '=', 'res.groups'),
            ('res_id', 'in', request.env.user.groups_id.ids)
        ])
        res['group_refs'] = groups.mapped(lambda g: g.complete_name)
        return res
