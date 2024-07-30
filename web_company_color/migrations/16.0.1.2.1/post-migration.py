# Copyright 2024 Tecnativa - Carlos Roca
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from openupgradelib import openupgrade


@openupgrade.migrate()
def migrate(env, version):
    companies = env["res.company"].search([("company_colors", "!=", False)])
    companies.scss_create_or_update_attachment()
