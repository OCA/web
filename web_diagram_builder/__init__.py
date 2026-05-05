from odoo import api, SUPERUSER_ID
from . import models


def post_init_hook(cr, registry):
    env = api.Environment(cr, SUPERUSER_ID, {})
    langs = env["res.lang"].search([("active", "=", True), ("code", "!=", "en_US")]).mapped("code")
    if langs:
        module = env["ir.module.module"].search([("name", "=", "web_diagram_builder")])
        module._update_translations(filter_lang=langs)
