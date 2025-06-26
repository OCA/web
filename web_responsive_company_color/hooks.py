from odoo import SUPERUSER_ID, api


def post_init_hook(cr, registry):
    env = api.Environment(cr, SUPERUSER_ID, {})
    env["res.company"].search([]).scss_create_or_update_attachment()
