# Copyright 2019 Alexandre Díaz <dev@redneboa.es>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
import base64
from odoo import api, SUPERUSER_ID
from .models.res_company import URL_BASE

def uninstall_hook(cr, registry):
    env = api.Environment(cr, SUPERUSER_ID, {})
    values = """
        $o-community-color: #7C7BAD; 
        $o-brand-odoo: $o-community-color;
        $o-brand-primary: $o-community-color;
        $o-main-text-color: #4c4c4c;
    """
    datas = base64.b64encode(values.encode('utf-8'))
    env["ir.attachment"].search([
        ('url', 'like', '%s%%' % URL_BASE)]).write({'datas': datas})
    env["ir.attachment"].search([('url', 'like', '%s%%' % URL_BASE)]).unlink()

def post_init_hook(cr, registry):
    env = api.Environment(cr, SUPERUSER_ID, {})
    env['res.company'].search([]).scss_create_or_update_attachment()
