from odoo import api, models
from odoo.http import request


class Http(models.AbstractModel):
    _inherit = 'ir.http'

    @api.model
    def session_info(self):
        session_info = super(Http, self).session_info()
        session_info['show_apps_menu_on_load'] = request.env.user.show_apps_menu_on_load
        return session_info
