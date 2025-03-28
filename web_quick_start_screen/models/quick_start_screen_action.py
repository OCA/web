# Copyright 2024 Tecnativa - David Vidal
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).
from odoo import fields, models
from odoo.tools.safe_eval import datetime, safe_eval


class DecontracStartScreenAction(models.Model):
    _name = "quick.start.screen.action"
    _description = "Actions to be launched from a quick start screen"
    _order = "sequence, id"

    active = fields.Boolean(default=True)
    sequence = fields.Integer()
    name = fields.Char(required=True, translate=True)
    image = fields.Image("Start screen icon", max_width=128, max_height=128, store=True)
    icon_name = fields.Char(help="Just set the Font Awesome icon name. e.g.: fa-truck")
    color = fields.Integer(help="Choose the icon color")
    description = fields.Html(translate=True)
    action_ref_id = fields.Reference(
        selection=[
            ("ir.actions.report", "ir.actions.report"),
            ("ir.actions.act_window", "ir.actions.act_window"),
            ("ir.actions.act_url", "ir.actions.act_url"),
            ("ir.actions.server", "ir.actions.server"),
            ("ir.actions.client", "ir.actions.client"),
        ],
        required=True,
    )
    domain = fields.Char(
        help="Add extra domain if needed. You can use `ref('<xml_id>')` and it will be"
        "evaluated. You can also use `datetime` and `context_today` in the same way"
        "`ir.filters` do."
    )
    context = fields.Char(
        help="Add extra context if needed. You can use `ref('<xml_id>')` and it will be"
        "evaluated. You can also use `datetime` and `context_today` in the same way"
        "`ir.filters` do."
    )

    def _safe_eval(self, expresion):
        return safe_eval(
            expresion,
            {
                "ref": lambda r: self.env.ref(r).id,
                "datetime": datetime,
                "context_today": datetime.datetime.now,
            },
        )

    def _get_extra_context(self):
        self.ensure_one()
        return self._safe_eval(self.context or "{}")

    def run_action(self):
        """Execute the action. We can override the action context if needed"""
        self.ensure_one()
        action = self.action_ref_id._get_action_dict()
        if self.context:
            extra_context = self._get_extra_context()
            # We need to deal with the active_id and overwrite it if needed
            # MIG TODO: Check if this is affected
            active_id = extra_context.get("active_id", 0)
            action["context"] = dict(
                safe_eval(action.get("context", "{}"), {"active_id": active_id}),
                **extra_context,
            )
        if self.domain:
            action["domain"] = self._safe_eval(self.domain)
        return action
