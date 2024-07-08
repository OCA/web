# Copyright 2024 Ooops404
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
from odoo import SUPERUSER_ID, api


def post_init_hook(cr, registry):
    env = api.Environment(cr, SUPERUSER_ID, {})
    rules = env["ir.rule"].search([])
    for rule in rules:
        rule.original_domain = rule.domain_force
