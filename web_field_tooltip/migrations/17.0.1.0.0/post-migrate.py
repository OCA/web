# Copyright 2024 Manuel Regidor <manuel.regidor@sygel.es>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import SUPERUSER_ID, api
from odoo.tools import html2plaintext


def migrate(cr, version):
    env = api.Environment(cr, SUPERUSER_ID, {})
    tooltips = env["ir.model.fields.tooltip"].search([])
    for tooltip in tooltips:
        tooltip.write({"tooltip_text": html2plaintext(tooltip.tooltip_text)})
