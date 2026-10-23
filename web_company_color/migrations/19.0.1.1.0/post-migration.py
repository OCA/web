# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from odoo import SUPERUSER_ID, api


def migrate(cr, version):
    env = api.Environment(cr, SUPERUSER_ID, {})
    # Regenerate stylesheets with the Odoo 19 templates; saved colours are kept.
    env["res.company"].search([]).scss_create_or_update_attachment()
