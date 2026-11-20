# Part of Odoo. See LICENSE file for full copyright and licensing details.

from . import controllers, models


def post_init_hook(env):
    langs = env["res.lang"].search([("active", "=", True), ("code", "!=", "en_US")]).mapped("code")
    if langs:
        module = env["ir.module.module"].search([("name", "=", "web_diagram")])
        module._update_translations(filter_lang=langs)
