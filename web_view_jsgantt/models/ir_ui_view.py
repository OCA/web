# SPDX-FileCopyrightText: 2024 Coop IT Easy SC
#
# SPDX-License-Identifier: AGPL-3.0-or-later

from odoo import fields, models


class IrUiView(models.Model):
    _inherit = "ir.ui.view"

    type = fields.Selection(
        selection_add=[("jsgantt", "JSGantt")],
        ondelete={"jsgantt": "cascade"},
    )

    def _onchange_able_view_jsgantt(self, node):
        return True
