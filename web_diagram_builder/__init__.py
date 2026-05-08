# Copyright 2024 TechnoLibre - Manel Guechetouli
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
from . import models


def post_init_hook(env):
    langs = env["res.lang"].search([("active", "=", True), ("code", "!=", "en_US")]).mapped("code")
    if langs:
        module = env["ir.module.module"].search([("name", "=", "web_diagram_builder")])
        module._update_translations(filter_lang=langs)
