# Copyright (C) 2019-Today: GTRAP (<http://www.grap.coop/>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo.http import Controller, route, request


class WebDashboardTile(Controller):

    @route('/web_dashboard_tile/create_tile', type='json', auth='user')
    def create_tile(self, model_name, *args, **kwargs):
        IrModel = request.env['ir.model']
        model = IrModel.search([('model', '=', model_name)])
        kwargs.update({'model_id': model.id})
        return request.env['tile.tile'].create(kwargs)
