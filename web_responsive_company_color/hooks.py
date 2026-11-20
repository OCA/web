from odoo import SUPERUSER_ID, api


def uninstall_hook(cr, registry):
    env = api.Environment(cr, SUPERUSER_ID, {})
    env["res.company"].with_context(uninstall_scss=True).search(
        []
    ).scss_create_or_update_attachment()


def post_init_hook(cr, registry):
    env = api.Environment(cr, SUPERUSER_ID, {})
    env["res.company"].search([]).scss_create_or_update_attachment()
